import chalk from 'chalk';
import { exec } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import type { TrackInfo } from '../tracks/TrackInfo';
import { getErrorMessage } from '../utils/getErrorMessage';
import { createProcessingCommand } from './createProcessingCommand';

/**
 * Process a file.
 * @param file - File path
 * @param param1 - Options
 */

export async function processFile(
  file: string,
  {
    encodeVideo,
    tracks,
    useGPU,
  }: {
    /** Video encoding type. */
    encodeVideo?: string;
    /** Tracks information. */
    tracks: TrackInfo[];
    /** Use gpu encoding instead of software encoding. */
    useGPU?: string;
  }
): Promise<void> {
  const outputFolder = path.join(path.dirname(file), '_encoded');
  try {
    const command = createProcessingCommand(file, {
      outputFolder,
      tracks,
      encodeVideo,
      useGPU,
    });

    await fs.mkdir(outputFolder, { recursive: true });
    const ffmpeg = exec(command);

    ffmpeg.stderr?.on('data', (data) => {
      const line: string = data.toString();
      if (line.includes('speed=')) {
        process.stdout.clearLine(0);
        process.stdout.cursorTo(0);
        process.stdout.write(data.toString());
      }
    });

    await new Promise<void>((resolve, reject) => {
      ffmpeg.on('exit', (code) => {
        if (code === 0) {
          console.log(chalk.green(`\nProcessed ${file} successfully.`));
          resolve();
        } else {
          reject(new Error(`ffmpeg process exited with code ${code}`));
        }
      });

      ffmpeg.on('error', (error) => {
        console.error(`Error processing ${file}: ${error.message}`);
        reject(error);
      });
    });
  } catch (error) {
    console.error(`Error processing ${file}: ${getErrorMessage(error)}`);
  }
}
