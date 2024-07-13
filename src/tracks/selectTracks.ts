import chalk from 'chalk';
import path from 'path';
import { askQuestion } from '../utils/askQuestion';
import { getTrackInfo } from './getTrackInfo';
import type { TrackInfo } from './TrackInfo';

/**
 * Extracks readable track name from {@link TrackInfo}.
 * @param trackInfo - Track info
 * @returns Track name
 */

function getTrackName(trackInfo: TrackInfo) {
  const language = trackInfo.language ?? 'unknown';
  return `${trackInfo.type} (${trackInfo.codecName}) track ${
    trackInfo.index
  }: ${language}${trackInfo.title ? ` - ${trackInfo.title}` : ''}`;
}

/**
 * Log information about tracks of a file.
 * @param file - File path
 * @param tracks - Array of tracks
 */

async function logFileTracks(file: string, tracks: TrackInfo[]): Promise<void> {
  console.log(chalk.bold(`Tracks for file: ${path.basename(file)}`));
  tracks.forEach((track) => {
    const actionType = track.keep ? 'Keep' : 'Remove';
    const trackColor = track.keep ? chalk.greenBright : chalk.redBright;
    console.log(trackColor(`  ${actionType} ${getTrackName(track)}`));
  });
}

/**
 * Manually change the selected tracks.
 * @param file - File path
 * @param tracks - Array of tracks
 * @returns Changed tracks
 */

async function changeSelectedTracks(
  file: string,
  tracks: TrackInfo[]
): Promise<TrackInfo[]> {
  const { changedTracks } = await askQuestion({
    type: 'multiselect',
    name: 'changedTracks',
    message: `Select tracks for ${path.basename(file)}`,
    choices: tracks.map((track, index) => {
      return {
        title: getTrackName(track),
        value: index,
        selected: track.keep,
      };
    }),
  });

  return tracks.map((track, index) => ({
    ...track,
    keep: changedTracks.includes(index),
  }));
}

/**
 * Try to automatically select valid tracks of files. Also offers to manually
 * change the selected tracks for each file individually.
 * @param files - Array of files
 * @returns Array of files and their selected tracks
 */

export async function selectTracks(files: string[]) {
  const filesWithTracks = await Promise.all(
    files.map(async (file) => ({
      file,
      tracks: await getTrackInfo(file),
    }))
  );

  let wantToChangeTracks = false;

  do {
    filesWithTracks.forEach(({ file, tracks }) => {
      logFileTracks(file, tracks);
    });

    const { changeTracks } = await askQuestion({
      type: 'toggle',
      name: 'changeTracks',
      message: 'Do you want to change the tracks to be kept?',
      active: 'Yes',
      inactive: 'No',
    });

    wantToChangeTracks = changeTracks;

    if (wantToChangeTracks) {
      for (const { file, tracks } of filesWithTracks) {
        const changedTracks = await changeSelectedTracks(file, tracks);
        filesWithTracks.find(
          (analyzedFile) => analyzedFile.file === file
        )!.tracks = changedTracks;
      }
    }
  } while (wantToChangeTracks);

  return filesWithTracks;
}
