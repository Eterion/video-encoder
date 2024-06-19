import chalk from 'chalk';
import { exec } from 'child_process';
import fs from 'fs/promises';
import inquirer from 'inquirer';
import path from 'path';
import type { TrackFilter } from './types/TrackFilter';
import { isEnglishSubtitleFilter } from './utils/isEnglishSubtitleFilter';
import { isJapaneseAudioFilter } from './utils/isJapaneseAudioFilter';

async function processFile(
  file: string,
  filters: TrackFilter[],
  encodeVideo: boolean = false
): Promise<void> {
  try {
    const outputFolder = path.join(path.dirname(file), '_encoded');

    const ffmpegParams: string[] = [
      `-c:v ${encodeVideo ? 'libx264 -crf 23' : 'copy'}`,
      '-c:a copy',
      '-c:s copy',
      '-map 0:v',
    ];
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
  const { encodeVideo } = await inquirer.prompt<{ encodeVideo: boolean }>([
    {
      type: 'confirm',
      name: 'encodeVideo',
      message: 'Encode video to H.264?',
      default: false,
    },
  ]);

  const { shouldProcess } = await inquirer.prompt<{ shouldProcess: boolean }>({
    type: 'confirm',
    name: 'shouldProcess',
    message: 'Do you want to proceed with processing?',
    default: false,
  });

  if (!shouldProcess) {
    console.log(chalk.yellow('Processing aborted by user.'));
    return;
  }

  for (const { file, trackFilters } of selectedTracks) {
    await processFile(file, trackFilters, encodeVideo);
  }
}
