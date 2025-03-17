import chalk from 'chalk';
import { isNotJunk } from 'junk';
import fs from 'node:fs/promises';
import path from 'node:path';
import type { Choice } from 'prompts';
import { askQuestion } from '../utils/askQuestion';
import { getPartitionDrives } from './getPartitionDrives';

/**
 * Navigate through file system to select a directory or a file.
 * @returns Selected directory or file
 */

export async function navigateFileSystem(): Promise<string | { file: string }> {
  const drives = await getPartitionDrives();
  let currentPath = '';

  while (true) {
    if (!currentPath) {
      const { selectedDrive } = await askQuestion({
        type: 'select',
        name: 'selectedDrive',
        message: 'Select a drive',
        choices: drives.map((drive) => ({
          title: `${drive.mount} ${drive.label}`,
          value: drive.mount,
        })),
      });

      currentPath = selectedDrive + '\\';
    }

    const files = await fs.readdir(currentPath, { withFileTypes: true });
    const notJunkFiles = files
      .filter((file) => isNotJunk(file.name))
      .sort((a, b) => a.name.localeCompare(b.name));

    const currentPathChoices: Choice[] = [
      {
        title: '.. (Parent Directory)',
        value: '..',
      },
      {
        title: chalk.greenBright('Select Current Directory'),
        value: '.',
      },
      ...notJunkFiles
        .filter((file) => file.isDirectory())
        .map((file) => ({
          title: '<' + file.name + '>',
          value: file.name,
        })),
      ...notJunkFiles
        .filter((file) => file.isFile())
        .map((file) => ({
          title: file.name,
          value: { file: path.join(currentPath, file.name) },
        })),
    ];

    const { selectedFolderOrFile } = await askQuestion({
      type: 'select',
      name: 'selectedFolderOrFile',
      message: `Select a directory or file (${currentPath})`,
      choices: currentPathChoices,
    });

    if (typeof selectedFolderOrFile === 'string') {
      // Select parent directory
      if (selectedFolderOrFile === '..') {
        if (path.dirname(currentPath) === currentPath) {
          currentPath = '';
        } else {
          currentPath = path.dirname(currentPath);
        }
      }
      // Select current folder
      else if (selectedFolderOrFile === '.') {
        return currentPath;
      }
      // Navigate into the selected directory
      else {
        currentPath = path.join(currentPath, selectedFolderOrFile);
      }
    } else {
      // Select a file
      return selectedFolderOrFile;
    }
  }
}
