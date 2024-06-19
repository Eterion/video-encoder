import inquirer from 'inquirer';
import path from 'path';

export async function selectFiles(files: string[]): Promise<string[]> {
  const { selectedFiles } = await inquirer.prompt<{ selectedFiles: string[] }>([
    {
      type: 'checkbox',
      name: 'selectedFiles',
      message: 'Select files to process',
      choices: files.map((file) => ({
        name: path.basename(file),
        value: file,
      })),
      default: files,
      pageSize: 20,
    },
  ]);

  return selectedFiles;
}
