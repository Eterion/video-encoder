import fs from 'fs/promises';
import path from 'path';
import { askQuestion } from './utils/askQuestion';

export async function scanForMediaFiles(directory: string): Promise<string[]> {
  const fileNames = await fs.readdir(directory);
  const files = fileNames.map((file) => path.join(directory, file));
  const extensions = files.map((file) => path.extname(file).toLowerCase());
  const uniqueExtensions = [...new Set(extensions)].filter((ext) => ext);

  const { selectedExtension } = await askQuestion({
    type: 'select',
    name: 'selectedExtension',
    message: 'Select file extension to process',
    choices: uniqueExtensions.map((ext) => ({ title: ext, value: ext })),
  });

  return files.filter((file) => {
    return path.extname(file).toLowerCase() === selectedExtension;
  });
}
