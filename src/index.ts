import { navigateFileSystem } from './file-system/navigateFileSystem';
import { scanForMediaFiles } from './file-system/scanForMediaFiles';
import { selectFiles } from './file-system/selectFiles';
import { startProcessing } from './process/startProcessing';
import { selectTracks } from './tracks/selectTracks';

async function main() {
  const directory = await navigateFileSystem();
  const mediaFiles = await scanForMediaFiles(directory);
  const selectedFiles = await selectFiles(mediaFiles);
  const selectedTracks = await selectTracks(selectedFiles);
  startProcessing(selectedTracks);
}

main();
