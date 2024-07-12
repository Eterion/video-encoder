import chalk from 'chalk';
import { exec } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import type { AsyncReturnType } from 'type-fest';
import type { TrackInfo } from './tracks/TrackInfo';
import { isEnglishSubtitleTrack } from './tracks/isEnglishSubtitleTrack';
import { isJapaneseAudioTrack } from './tracks/isJapaneseAudioTrack';
import type { selectTracks } from './tracks/selectTracks';
import { askQuestion } from './utils/askQuestion';
import { getGPUVendor } from './utils/getGPUVendor';

async function processFile(
  file: string,
  filters: TrackInfo[],
  encodeVideo?: string,
  useGPU?: AsyncReturnType<typeof getGPUVendor>
): Promise<void> {
  try {
    const outputFolder = path.join(path.dirname(file), '_encoded');
    const ffmpegParams: string[] = [];

    ffmpegParams.push('-map 0:v');
    if (encodeVideo === 'h264') {
      switch (useGPU) {
        case 'nvidia':
          ffmpegParams.push(
            '-c:v h264_nvenc -preset slow -rc vbr -cq 18 -b:v 2M -maxrate 5M -tune animation'
          );
          break;
        case 'amd':
          ffmpegParams.push(
            '-c:v h264_amf -quality slow -cq 18 -tune animation'
          );
          break;
        default:
          ffmpegParams.push(
            '-c:v libx264 -preset slow -crf 18 -tune animation -x264-params "aq-mode=3:aq-strength=0.8"'
          );
          break;
      }
    } else if (encodeVideo === 'h265') {
      switch (useGPU) {
        case 'nvidia':
          ffmpegParams.push(
            '-c:v hevc_nvenc -preset slow -rc vbr -cq 18 -b:v 2M -maxrate 5M'
          );
          break;
        case 'amd':
          ffmpegParams.push('-c:v hevc_amf -quality slow -cq 18');
          break;
        default:
          ffmpegParams.push(
            '-c:v libx265 -preset slow -crf 18 -x265-params "limit-sao:bframes=8:psy-rd=1.5:psy-rdoq=2:aq-mode=3"'
          );
          break;
      }
    } else {
      ffmpegParams.push('-c:v copy'); // Copy video stream without encoding
    }

    const audioTracks = filters.filter(isJapaneseAudioTrack);
    if (audioTracks.length > 0)
      audioTracks.forEach((track, index) => {
        ffmpegParams.push(`-map 0:a:${track.index}`);
        ffmpegParams.push(
          track.codecName === 'flac'
            ? `-c:a:${index} libopus -b:a:${index} 192k -vbr:${index} on -compression_level:${index} 10`
            : `-c:a:${index} copy` // Copy audio stream without encoding
        );
        if (track.language !== 'jpn')
          ffmpegParams.push(`-metadata:s:a:${index} language=jpn`);
        if (index === 0) ffmpegParams.push(`-disposition:a:${index} default`);
      });

    ffmpegParams.push('-c:s copy'); // Copy subtitle streams without encoding
    const subtitleTracks = filters.filter(isEnglishSubtitleTrack);
    if (subtitleTracks.length > 0)
      subtitleTracks.forEach((track, index) => {
        ffmpegParams.push(`-map 0:s:${track.index}`);
        if (track.language !== 'eng')
          ffmpegParams.push(`-metadata:s:s:${index} language=eng`);
        if (index === 0) ffmpegParams.push(`-disposition:s:${index} default`);
      });

    // Include chapters
    ffmpegParams.push('-map_chapters 0');

    // Include attachments
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
  selectedTracks: AsyncReturnType<typeof selectTracks>
): Promise<void> {
  const { encodeVideo } = await askQuestion({
    type: 'select',
    name: 'encodeVideo',
    message: 'Select video encoding option:',
    choices: [
      { title: 'No encoding', value: null },
      { title: 'H.264 (AVC)', value: 'h264' },
      { title: 'H.265 (HEVC)', value: 'h265' },
    ],
  });

  const gpuVendor = await getGPUVendor();
  let useGPU: AsyncReturnType<typeof getGPUVendor>;
  if (encodeVideo && gpuVendor) {
    const { gpuEncoding } = await askQuestion({
      type: 'toggle',
      name: 'gpuEncoding',
      message: `Use GPU (${gpuVendor}) for encoding?`,
      active: 'Yes',
      inactive: 'No',
    });
    if (gpuEncoding) useGPU = gpuVendor;
  }

  const { shouldProcess } = await askQuestion([
    {
      type: 'toggle',
      name: 'shouldProcess',
      message: 'Do you want to proceed with processing?',
      active: 'Yes',
      inactive: 'No',
    },
  ]);

  if (!shouldProcess) {
    console.log(chalk.yellow('Processing aborted by user.'));
    return;
  }

  for (const { file, tracks: trackFilters } of selectedTracks) {
    await processFile(file, trackFilters, encodeVideo, useGPU);
  }
}
