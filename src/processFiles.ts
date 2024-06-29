import chalk from 'chalk';
import { exec } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import prompts from 'prompts';
import type { TrackFilter } from './types/TrackFilter';
import { handlePromptsOptions } from './utils/handlePromptsOptions';
import { isEnglishSubtitleFilter } from './utils/isEnglishSubtitleFilter';
import { isJapaneseAudioFilter } from './utils/isJapaneseAudioFilter';

type GPUOption = 'nvidia' | 'amd' | null;

async function processFile(
  file: string,
  filters: TrackFilter[],
  encodeVideo: string | null = null,
  useGPU: GPUOption = null,
  crfValue: number = 23
): Promise<void> {
  try {
    const outputFolder = path.join(path.dirname(file), '_encoded');

    const ffmpegParams: string[] = [
      '-c:a copy', // Copy all audio streams without re-encoding
      '-c:s copy', // Copy all subtitle streams without re-encoding
      '-map 0:v', // Map all video streams from the input file
      '-map_chapters 0', // Include chapters from the input file
    ];

    if (encodeVideo === 'h264') {
      let videoCodec = '';
      switch (useGPU) {
        case 'nvidia':
          videoCodec = 'h264_nvenc';
          break;
        case 'amd':
          videoCodec = 'h264_amf';
          break;
        default:
          videoCodec = 'libx264';
          break;
      }
      ffmpegParams.push(`-c:v ${videoCodec} -crf ${crfValue}`);
    } else if (encodeVideo === 'h265') {
      let videoCodec = '';
      switch (useGPU) {
        case 'nvidia':
          videoCodec = 'hevc_nvenc';
          break;
        case 'amd':
          videoCodec = 'hevc_amf';
          break;
        default:
          videoCodec = 'libx265';
          break;
      }
      ffmpegParams.push(`-c:v ${videoCodec} -crf ${crfValue}`);
    } else {
      ffmpegParams.push('-c:v copy'); // No video encoding, just copy
    }

    const audioTracks = filters.filter(isJapaneseAudioFilter);
    if (audioTracks.length > 0)
      audioTracks.forEach((track, index) => {
        ffmpegParams.push(`-map 0:a:${track.index}`);
        if (track.language !== 'jpn')
          ffmpegParams.push(`-metadata:s:a:${index} language=jpn`);
        if (index === 0) ffmpegParams.push(`-disposition:a:${index} default`);
      });

    const subtitleTracks = filters.filter(isEnglishSubtitleFilter);
    if (subtitleTracks.length > 0)
      subtitleTracks.forEach((track, index) => {
        ffmpegParams.push(`-map 0:s:${track.index}`);
        if (track.language !== 'eng')
          ffmpegParams.push(`-metadata:s:s:${index} language=eng`);
        if (index === 0) ffmpegParams.push(`-disposition:s:${index} default`);
      });

    // Map and copy attachment streams
    ffmpegParams.push('-map 0:t');

    let ffmpegCommand = `ffmpeg -i "${file}" ${ffmpegParams.join(' ')}`;

    const outputFileName = path.basename(file);
    const outputPath = path.join(outputFolder, outputFileName);
    ffmpegCommand += ` -y "${outputPath}"`;

    await fs.mkdir(outputFolder, { recursive: true });

    const ffmpegProcess = exec(ffmpegCommand);

    ffmpegProcess.stderr?.on('data', (data) => {
      const line: string = data.toString();
      if (line.includes('speed=')) {
        process.stdout.clearLine(0);
        process.stdout.cursorTo(0);
        process.stdout.write(data.toString());
      }
    });

    await new Promise<void>((resolve, reject) => {
      ffmpegProcess.on('exit', (code) => {
        if (code === 0) {
          console.log(chalk.green(`\nProcessed ${file} successfully.`));
          resolve();
        } else {
          reject(new Error(`ffmpeg process exited with code ${code}`));
        }
      });

      ffmpegProcess.on('error', (error) => {
        console.error(`Error processing ${file}: ${error.message}`);
        reject(error);
      });
    });
  } catch (error) {
    console.error(`Error processing ${file}: ${(error as Error).message}`);
  }
}

export async function processFiles(
  selectedTracks: {
    file: string;
    trackFilters: TrackFilter[];
  }[]
): Promise<void> {
  const { encodeVideo, useGPU, crfValue, shouldProcess } = await prompts(
    [
      {
        type: 'select',
        name: 'encodeVideo',
        message: 'Select video encoding option:',
        choices: [
          { title: 'No encoding', value: null },
          { title: 'H.264 (AVC)', value: 'h264' },
          { title: 'H.265 (HEVC)', value: 'h265' },
        ],
      },
      {
        type: (prev) => (prev ? 'select' : null),
        name: 'useGPU',
        message: 'Select GPU for encoding:',
        choices: [
          { title: 'None (CPU)', value: null },
          { title: 'NVIDIA GPU', value: 'nvidia' },
          { title: 'AMD GPU', value: 'amd' },
        ],
      },
      {
        type: (prev) => (prev ? 'select' : null),
        name: 'crfValue',
        message: 'Select CRF value (lower is higher quality):',
        choices: (_prev, values) => {
          if (values.encodeVideo === 'h264') {
            return [
              { title: '18 (High quality)', value: 18 },
              { title: '20 (Good quality)', value: 20 },
              { title: '23 (Default)', value: 23 },
              { title: '28 (Lower quality, smaller size)', value: 28 },
              { title: '30 (Low quality, smallest size)', value: 30 },
            ];
          } else if (values.encodeVideo === 'h265') {
            return [
              { title: '20 (High quality)', value: 20 },
              { title: '23 (Good quality)', value: 23 },
              { title: '28 (Default)', value: 28 },
              { title: '30 (Lower quality, smaller size)', value: 30 },
              { title: '35 (Low quality, smallest size)', value: 35 },
            ];
          }
          return [];
        },
      },
      {
        type: 'toggle',
        name: 'shouldProcess',
        message: 'Do you want to proceed with processing?',
        active: 'Yes',
        inactive: 'No',
      },
    ],
    handlePromptsOptions()
  );

  if (!shouldProcess) {
    console.log(chalk.yellow('Processing aborted by user.'));
    return;
  }

  for (const { file, trackFilters } of selectedTracks) {
    await processFile(file, trackFilters, encodeVideo, useGPU, crfValue);
  }
}
