import { navigateFileSystem } from './file-system/navigateFileSystem';
import { scanForFiles } from './file-system/scanForFiles';
import { selectFiles } from './file-system/selectFiles';
import { startProcessing } from './process/startProcessing';
import { selectTracks } from './tracks/selectTracks';

async function main() {
  let selectedFiles: string[] = [];
  const selectedFolderOrFile = await navigateFileSystem();

  // Selection is a directory
  if (typeof selectedFolderOrFile === 'string') {
    const scannedFiles = await scanForFiles(selectedFolderOrFile);
    selectedFiles = await selectFiles(scannedFiles);
  }
  // Selection is a file
  else {
    selectedFiles = [selectedFolderOrFile.file];
  }

  const selectedTracks = await selectTracks(selectedFiles);
  startProcessing(selectedTracks);
}

main();
