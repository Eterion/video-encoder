import inquirer from 'inquirer';
import path from 'path';
import type { TrackFilter } from './types/TrackFilter';

export async function modifyTracks(
  file: string,
  filters: TrackFilter[]
): Promise<TrackFilter[]> {
  const { modifiedFilters } = await inquirer.prompt<{
    modifiedFilters: number[];
  }>([
    {
      type: 'checkbox',
      name: 'modifiedFilters',
      message: `Modify tracks for ${path.basename(file)}`,
      choices: filters.map((filter, index) => ({
        name: `${filter.type} - ${filter.language ?? 'unknown'}${
          filter.title ? ` - ${filter.title}` : ''
        }`,
        value: index,
        checked: filter.keep,
      })),
      pageSize: filters.length,
    },
  ]);

  return filters.map((filter, index) => ({
    ...filter,
    keep: modifiedFilters.includes(index),
  }));
}
