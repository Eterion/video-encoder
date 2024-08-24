import chalk from 'chalk';
import { exec } from 'child_process';
import { SingleBar } from 'cli-progress';
import fs from 'fs/promises';
import path from 'path';
import type { TrackInfo } from '../tracks/TrackInfo';
import { getErrorMessage } from '../utils/getErrorMessage';
import { createProcessingCommand } from './createProcessingCommand';
import { getTotalFrames } from './getTotalFramets';
import { parseOutput } from './parseOutput';

/**
 * Process a file.
 * @param file - File path
 * @param options - Options
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
    console.log('Started processing:', chalk.greenBright(path.basename(file)));
    console.log(chalk.gray(command));

    const totalFrames = getTotalFrames(tracks);
    const progressBar = (() => {
      if (totalFrames) {
        const bar = new SingleBar({
          format:
            chalk.cyan('{bar}') +
            ' | {percentage}% | {value}/{total} | {fps} fps | {size} | Elapsed: {duration_formatted} | ETA: {eta_formatted}',
          barCompleteChar: '\u2588',
          barIncompleteChar: '\u2591',
          hideCursor: true,
        });
        bar.start(totalFrames, 0, {
          fps: 'N/A',
          size: 'N/A',
        });
        return bar;
      }
      return undefined;
    })();

    ffmpeg.stderr?.on('data', (data) => {
      const line: string = data.toString();
      if (line.includes('frame=')) {
        if (progressBar) {
          const { frame, ...metadata } = parseOutput(line);
          progressBar.update(Number(frame), metadata);
        } else {
          process.stdout.clearLine(0);
          process.stdout.cursorTo(0);
          process.stdout.write(data.toString());
        }
      }
    });

    await new Promise<void>((resolve, reject) => {
      ffmpeg.on('exit', (code) => {
        progressBar?.stop();
        if (code === 0) {
          console.log(chalk.green(`\nProcessed ${file} successfully.`));
          resolve();
        } else {
          reject(`ffmpeg process exited with code ${code}`);
        }
      });

      ffmpeg.on('error', (error) => {
        reject(error);
      });
    });
  } catch (error) {
    console.error(
      `${chalk.red(`Error processing ${file}`)}: ${getErrorMessage(error)}`
    );
  }
}
