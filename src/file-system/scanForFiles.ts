import fs from 'node:fs/promises';
import path from 'node:path';
import { askQuestion } from '../utils/askQuestion';

/**
 * Scan a directory for media files by extension.
 * @param directory - Directory path
 * @returns Array of files
 */

export async function scanForFiles(directory: string): Promise<string[]> {
  const fileNames = await fs.readdir(directory);
  const files = fileNames.map((file) => path.join(directory, file));
  const extensions = files.map((file) => path.extname(file).toLowerCase());
  const uniqueExtensions = [...new Set(extensions)].filter((ext) => ext);

  let selectedExtensions;

  if (uniqueExtensions.length === 1) {
    selectedExtensions = uniqueExtensions;
  } else {
    const { extensions } = await askQuestion({
      type: 'multiselect',
      name: 'extensions',
      message: 'Select file extensions to process',
      choices: uniqueExtensions.map((ext) => ({
        title: ext,
        value: ext,
      })),
    });
    selectedExtensions = extensions;
  }

  return files.filter((file) => {
    return selectedExtensions.includes(path.extname(file).toLowerCase());
  });
}
