import fs from 'fs/promises';
import path from 'path';
import prompts from 'prompts';
import { handlePromptsOptions } from './utils/handlePromptsOptions';

export async function scanForMediaFiles(directory: string): Promise<string[]> {
  const filesInDirectory = await fs.readdir(directory);
  const files = filesInDirectory.map((file) => path.join(directory, file));
  const extensions = files.map((file) => path.extname(file).toLowerCase());
  const uniqueExtensions = Array.from(new Set(extensions)).filter(
    (ext) => ext !== ''
  );

  const { selectedExtension } = await prompts(
    {
      type: 'select',
      name: 'selectedExtension',
      message: 'Select file extension to process',
      choices: uniqueExtensions.map((ext) => ({ title: ext, value: ext })),
    },
    handlePromptsOptions()
  );

  return files.filter((file) => {
    return path.extname(file).toLowerCase() === selectedExtension;
  });
}
