import fs from 'fs/promises';
import inquirer from 'inquirer';
import path from 'path';

export async function scanForMediaFiles(directory: string): Promise<string[]> {
  const files = (await fs.readdir(directory)).map((file) =>
    path.join(directory, file)
  );

  const extensions = files.map((file) => path.extname(file).toLowerCase());
  const uniqueExtensions = Array.from(new Set(extensions)).filter(
    (ext) => ext !== ''
  );

  const { selectedExtension } = await inquirer.prompt<{
    selectedExtension: string;
  }>([
    {
      type: 'list',
      name: 'selectedExtension',
      message: 'Select file extension to process',
      choices: uniqueExtensions,
    },
  ]);

  return files.filter(
    (file) => path.extname(file).toLowerCase() === selectedExtension
  );
}
