import chalk from 'chalk';
import path from 'path';
import type { TrackFilter } from './types/TrackFilter';
import { isAudioFilter } from './utils/isAudioFilter';

export async function printTrackFilters(
  file: string,
  filters: TrackFilter[]
): Promise<void> {
  console.log(chalk.bold(`\nTracks for file: ${path.basename(file)}`));

  filters.forEach((filter) => {
    const actionType = filter.keep ? 'Keep' : 'Remove';
    const trackType = isAudioFilter(filter) ? 'Audio' : 'Subtitle';
    const trackColor = filter.keep ? chalk.greenBright : chalk.redBright;
    const language = filter.language ?? 'unknown';
    console.log(
      `${trackColor(
        `  ${actionType} ${trackType} track ${filter.index}: ${language}${
          filter.title ? ` - ${filter.title}` : ''
        }`
      )}`
    );
  });
}
