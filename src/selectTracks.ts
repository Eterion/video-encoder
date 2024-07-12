import chalk from 'chalk';
import path from 'path';
import prompts from 'prompts';
import { analyzeTracks } from './analyzeTracks';
import type { TrackFilter } from './types/TrackFilter';
import { handlePromptsOptions } from './utils/handlePromptsOptions';

function trackFilterTitle(filter: TrackFilter) {
  const language = filter.language ?? 'unknown';
  return `${filter.type} (${filter.codecName}) track ${
    filter.index
  }: ${language}${filter.title ? ` - ${filter.title}` : ''}`;
}

async function printTrackFilters(
  file: string,
  filters: TrackFilter[]
): Promise<void> {
  console.log(chalk.bold(`\nTracks for file: ${path.basename(file)}`));

  filters.forEach((filter) => {
    const actionType = filter.keep ? 'Keep' : 'Remove';
    const trackColor = filter.keep ? chalk.greenBright : chalk.redBright;
    console.log(trackColor(`  ${actionType} ${trackFilterTitle(filter)}`));
  });
}

async function customizeTracks(
  file: string,
  trackFilters: TrackFilter[]
): Promise<TrackFilter[]> {
  const { modifiedFilters } = await prompts(
    {
      type: 'multiselect',
      name: 'modifiedFilters',
      message: `Customize tracks for ${path.basename(file)}`,
      choices: trackFilters.map((filter, index) => {
        return {
          title: trackFilterTitle(filter),
          value: index,
          selected: filter.keep,
        };
      }),
    },
    handlePromptsOptions()
  );

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

  let shouldCustomize = false;

  do {
    analyzedFiles.forEach(({ file, trackFilters }) => {
      printTrackFilters(file, trackFilters);
    });

    const { modifyTracks } = await prompts(
      {
        type: 'toggle',
        name: 'modifyTracks',
        message: 'Do you want to modify the tracks to be kept?',
        active: 'Yes',
        inactive: 'No',
      },
      handlePromptsOptions()
    );

    shouldCustomize = modifyTracks;

    if (shouldCustomize) {
      for (const { file, trackFilters } of analyzedFiles) {
        const customTracks = await customizeTracks(file, trackFilters);
        analyzedFiles.find(
          (analyzedFile) => analyzedFile.file === file
        )!.trackFilters = customTracks;
      }
    }
  } while (shouldCustomize);

  return analyzedFiles;
}
