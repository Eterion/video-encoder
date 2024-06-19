import inquirer from 'inquirer';
import path from 'path';
import { analyzeTracks } from './analyzeTracks';
import { printTrackFilters } from './printTrackFilters';
import type { TrackFilter } from './types/TrackFilter';

async function changeTracks(
  file: string,
  trackFilters: TrackFilter[]
): Promise<TrackFilter[]> {
  const { modifiedFilters } = await inquirer.prompt<{
    modifiedFilters: number[];
  }>([
    {
      type: 'checkbox',
      name: 'modifiedFilters',
      message: `Modify tracks for ${path.basename(file)}`,
      choices: trackFilters.map((filter, index) => ({
        name: `${filter.type} - ${filter.language ?? 'unknown'} - ${
          filter.title ?? 'no title'
        } (keep: ${filter.keep})`,
        value: index,
        checked: filter.keep,
      })),
    },
  ]);

  return trackFilters.map((filter, index) => ({
    ...filter,
    keep: modifiedFilters.includes(index),
  }));
}

export async function selectTracks(files: string[]) {
  const analyzedFiles = await Promise.all(
    files.map(async (file) => ({
      file,
      trackFilters: await analyzeTracks(file),
    }))
  );

  let shouldModify = false;

  do {
    analyzedFiles.forEach(({ file, trackFilters }) => {
      printTrackFilters(file, trackFilters);
    });

    const { modifyTracks } = await inquirer.prompt<{ modifyTracks: boolean }>({
      type: 'confirm',
      name: 'modifyTracks',
      message: 'Do you want to modify the tracks to be kept?',
      default: false,
    });

    shouldModify = modifyTracks;

    if (shouldModify) {
      for (const { file, trackFilters } of analyzedFiles) {
        const modifiedFilters = await changeTracks(file, trackFilters);
        analyzedFiles.find(
          (analyzedFile) => analyzedFile.file === file
        )!.trackFilters = modifiedFilters;
      }
    }
  } while (shouldModify);

  return analyzedFiles;
}
