import chalk from 'chalk';
import { exec } from 'child_process';
import { partial } from 'filesize';
import fs from 'fs/promises';
import path from 'path';
import { promisify } from 'util';
import { askQuestion } from './utils/askQuestion';

const formatFileSize = partial({ standard: 'jedec' });
const execPromise = promisify(exec);

async function getFileInfo(
  file: string
): Promise<{ size?: number; encoding: string; resolution: string }> {
  let size: number | undefined;
  let encoding: string = 'N/A';
  let resolution: string = 'N/A';

  // Get file size
  try {
    const stats = await fs.stat(file);
    size = stats.size;
  } catch (error) {
    size = undefined;
  }

  // Get video encoding and resolution if it's a media file
  try {
    const { stdout: encodingOutput } = await execPromise(
      `ffprobe -v error -select_streams v:0 -show_entries stream=codec_name -of default=noprint_wrappers=1:nokey=1 "${file}"`
    );
    if (encodingOutput) {
      encoding = encodingOutput.trim();
    }

    const { stdout: resolutionOutput } = await execPromise(
      `ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=s=x:p=0 "${file}"`
    );
    if (resolutionOutput) {
      const [width, height] = resolutionOutput.trim().split('x').map(Number);
      if (width && height) {
        resolution = formatResolution(width, height);
      }
    }
  } catch (error) {
    // Ignore errors for non-media files or issues with ffprobe
  }

  return { size, encoding, resolution };
}

function formatResolution(width: number, height: number): string {
  if (width >= 3840 && height >= 2160) {
    return '4K';
  } else if (width >= 2560 && height >= 1440) {
    return '1440p';
  } else if (width >= 1920 && height >= 1080) {
    return '1080p';
  } else if (width >= 1280 && height >= 720) {
    return '720p';
  } else if (width >= 854 && height >= 480) {
    return '480p';
  } else if (width >= 640 && height >= 360) {
    return '360p';
  } else {
    return `${width}x${height}`;
  }
}

export async function selectFiles(files: string[]): Promise<string[]> {
  const choices = await Promise.all(
    files.map(async (file) => {
      const { size, encoding, resolution } = await getFileInfo(file);
      const formattedSize =
        size === undefined ? 'Unknown size' : formatFileSize(size);
      return {
        title: `${path.basename(file)} | ${chalk.yellowBright(
          formattedSize
        )} | ${chalk.magentaBright(encoding)} | ${chalk.cyanBright(
          resolution
        )}`,
        value: file,
        selected: true,
      };
    })
  );

  const { selectedFiles } = await askQuestion({
    type: 'multiselect',
    name: 'selectedFiles',
    message: 'Select files to process',
    choices,
  });

  return selectedFiles;
}
