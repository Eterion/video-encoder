import chalk from 'chalk';
import { exec } from 'child_process';
import fs from 'fs/promises';
import { isNotJunk } from 'junk';
import path from 'path';
import prompts, { type Choice } from 'prompts';
import { handlePromptsOptions } from './utils/handlePromptsOptions';

async function partitionDrives(): Promise<string[]> {
  return new Promise<string[]>((resolve, reject) => {
    exec('wmic logicaldisk get caption', (err, stdout, stderr) => {
      if (err) {
        reject(err);
        return;
      }

      if (stderr) {
        reject(new Error(stderr));
        return;
      }

      // Split stdout into lines and filter out non-drive lines
      const lines = stdout.trim().split(/\s+/);
      const drives = lines.filter((line) => /^[A-Za-z]:$/.test(line));
      resolve(drives);
    });
  });
}

export async function navigateFileSystem(): Promise<string> {
  const drives = await partitionDrives();
  let currentPath = '';
  const SELECT_DIR_VALUE = Symbol();

  while (true) {
    if (!currentPath) {
      const { selectedDrive } = await prompts(
        {
          type: 'select',
          name: 'selectedDrive',
          message: 'Select a drive',
          choices: drives.map((drive) => ({ title: drive, value: drive })),
        },
        handlePromptsOptions()
      );

      currentPath = selectedDrive + '\\';
    }

    const files = await fs.readdir(currentPath, { withFileTypes: true });
    const notJunkFiles = files.filter((file) => isNotJunk(file.name));

    const directoryFileChoices: Choice[] = [
      {
        title: '.. (Parent Directory)',
        value: '..',
      },
      {
        title: chalk.greenBright('Select Current Directory'),
        value: SELECT_DIR_VALUE,
      },
      ...notJunkFiles
        .filter((file) => file.isDirectory())
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((file) => ({
          title: '<' + file.name + '>',
          value: file.name,
        })),
      ...notJunkFiles
        .filter((file) => file.isFile())
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((file) => ({
          title: file.name,
          value: file.name,
        })),
    ];

    const { selectedDir } = await prompts(
      {
        type: 'select',
        name: 'selectedDir',
        message: `Select a directory (${currentPath})`,
        choices: directoryFileChoices,
      },
      handlePromptsOptions()
    );

    if (selectedDir === '..') {
      if (path.dirname(currentPath) === currentPath) {
        currentPath = '';
      } else {
        currentPath = path.dirname(currentPath);
      }
    } else if (selectedDir === SELECT_DIR_VALUE) {
      return currentPath;
    } else {
      const selectedPath = path.join(currentPath, selectedDir);
      const stats = await fs.lstat(selectedPath);
      if (stats.isDirectory()) {
        currentPath = selectedPath;
      } else {
        console.log('Please select a directory.');
      }
    }
  }
}
