import chalk from 'chalk';
import fs from 'fs/promises';
import inquirer from 'inquirer';
import { isNotJunk } from 'junk';
import path from 'path';
import { getPartitionDrives } from './getPartitionDrives';

export async function navigateFileSystem(): Promise<string> {
  const drives = await getPartitionDrives();

  const { selectedDrive } = await inquirer.prompt<{ selectedDrive: string }>({
    type: 'list',
    name: 'selectedDrive',
    message: 'Select a drive:',
    choices: drives,
  });

  let currentPath = selectedDrive + '\\';
  const SELECT_DIR_VALUE = 'SELECT_CURRENT_DIRECTORY';

  while (true) {
    const files = (
      await fs.readdir(currentPath, { withFileTypes: true })
    ).filter((file) => isNotJunk(file.name));

    const choices = [
      {
        name: '.. (Parent Directory)',
        value: '..',
      },
      {
        name: chalk.greenBright('Select Current Directory'),
        value: SELECT_DIR_VALUE,
      },
      ...files
        .filter((file) => file.isDirectory())
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((file) => ({
          name: '<' + file.name + '>',
          value: file.name,
        })),
      ...files
        .filter((file) => file.isFile())
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((file) => ({
          name: file.name,
          value: file.name,
        })),
    ];

    const { selectedFile } = await inquirer.prompt<{ selectedFile: string }>({
      type: 'list',
      name: 'selectedFile',
      message: `Current Directory: ${currentPath}`,
      choices,
      pageSize: 20,
    });

    if (selectedFile === '..') {
      currentPath = path.dirname(currentPath);
    } else if (selectedFile === SELECT_DIR_VALUE) {
      return currentPath;
    } else {
      const selectedPath = path.join(currentPath, selectedFile);
      const stats = await fs.lstat(selectedPath);
      if (stats.isDirectory()) {
        currentPath = selectedPath;
      } else {
        console.log('Please select a directory.');
      }
    }
  }
}
