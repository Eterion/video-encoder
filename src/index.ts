import { navigateFileSystem } from './navigateFileSystem';
import { processFiles } from './processFiles';
import { scanForMediaFiles } from './scanForMediaFiles';
import { selectFiles } from './selectFiles';
import { selectTracks } from './tracks/selectTracks';

async function main() {
  const directory = await navigateFileSystem();
  const mediaFiles = await scanForMediaFiles(directory);
  const selectedFiles = await selectFiles(mediaFiles);
  const selectedTracks = await selectTracks(selectedFiles);
  processFiles(selectedTracks);
}

main();
