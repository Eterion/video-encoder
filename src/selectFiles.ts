import chalk from 'chalk';
import { exec } from 'child_process';
import { partial } from 'filesize';
import fs from 'fs/promises';
import path from 'path';
import prompts from 'prompts';
import { promisify } from 'util';
import { handlePromptsOptions } from './utils/handlePromptsOptions';

const formatFileSize = partial({ standard: 'jedec' });
const execPromise = promisify(exec);

async function getFileInfo(
  file: string
): Promise<{ size?: number; encoding: string }> {
  let size: number | undefined;
  let encoding: string = 'N/A';

  // Get file size
  try {
    const stats = await fs.stat(file);
    size = stats.size;
  } catch (error) {
    size = undefined;
  }

  // Get video encoding if it's a media file
  try {
    const { stdout } = await execPromise(
      `ffprobe -v error -select_streams v:0 -show_entries stream=codec_name -of default=noprint_wrappers=1:nokey=1 "${file}"`
    );
    if (stdout) {
      encoding = stdout.trim();
    }
  } catch (error) {
    // Ignore errors for non-media files or issues with ffprobe
  }

  return { size, encoding };
}

export async function selectFiles(files: string[]): Promise<string[]> {
  const choices = await Promise.all(
    files.map(async (file) => {
      const { size, encoding } = await getFileInfo(file);
      const formattedSize =
        size === undefined ? 'Unknown size' : formatFileSize(size);
      return {
        title: `${path.basename(file)} | ${chalk.yellowBright(
          formattedSize
        )} | ${chalk.magentaBright(encoding)}`,
        value: file,
        selected: true,
      };
    })
  );

  const { selectedFiles } = await prompts(
    {
      type: 'multiselect',
      name: 'selectedFiles',
      message: 'Select files to process',
      choices,
    },
    handlePromptsOptions()
  );

  return selectedFiles;
}
