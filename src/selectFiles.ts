import path from 'path';
import prompts from 'prompts';
import { handlePromptsOptions } from './utils/handlePromptsOptions';

export async function selectFiles(files: string[]): Promise<string[]> {
  const { selectedFiles } = await prompts(
    {
      type: 'multiselect',
      name: 'selectedFiles',
      message: 'Select files to process',
      choices: files.map((file) => ({
        title: path.basename(file),
        value: file,
        selected: true,
      })),
    },
    handlePromptsOptions()
  );

  return selectedFiles;
}
