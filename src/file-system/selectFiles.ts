import chalk from 'chalk';
import path from 'path';
import type { Choice } from 'prompts';
import { askQuestion } from '../utils/askQuestion';
import { formatFileSize } from '../utils/formatFileSize';
import { formatVideoResolution } from '../utils/formatVideoResolution';
import { getMediaFileInfo } from './getMediaFileInfo';

/**
 * Select from array of files.
 * @param files - File paths
 * @returns Array of selected files
 */

export async function selectFiles(files: string[]): Promise<string[]> {
  const choices = await Promise.all(
    files.map<Promise<Choice>>(async (file) => {
      const { size, encoding, resolution } = await getMediaFileInfo(file);
      const formattedSize = size ? formatFileSize(size) : 'Unknown size';
      const formattedEncoding = encoding || 'Unknown encoding';
      const formattedResolution = resolution
        ? formatVideoResolution(resolution)
        : 'Unknown resolution';
      return {
        title: [
          path.basename(file),
          chalk.yellowBright(formattedSize),
          chalk.magentaBright(formattedEncoding),
          chalk.cyanBright(formattedResolution),
        ].join(' | '),
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
