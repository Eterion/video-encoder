import { navigateFileSystem } from './file-system/navigateFileSystem';
import { scanForMediaFiles } from './file-system/scanForMediaFiles';
import { selectFiles } from './file-system/selectFiles';
import { startProcessing } from './process/startProcessing';
import { selectTracks } from './tracks/selectTracks';

async function main() {
  let selectedFiles: string[] = [];
  const selectedFolderOrFile = await navigateFileSystem();

  // Selection is a directory
  if (typeof selectedFolderOrFile === 'string') {
    const mediaFiles = await scanForMediaFiles(selectedFolderOrFile);
    selectedFiles = await selectFiles(mediaFiles);
  }
  // Selection is a file
  else {
    selectedFiles = [selectedFolderOrFile.file];
  }

  const selectedTracks = await selectTracks(selectedFiles);
  startProcessing(selectedTracks);
}

main();
