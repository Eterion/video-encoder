import type { TrackInfo } from '../tracks/TrackInfo';

/**
 * Extract total frames from video track.
 * @param tracks - Tracks info
 * @returns Number of frames
 */

export function getTotalFrames(tracks: TrackInfo[]) {
  const videoTrack = tracks.find(({ type }) => {
    return type === 'video';
  });

  // Default framebs
  const nbFrames = parseInt(videoTrack?.metadata.nb_frames || '');
  if (!isNaN(nbFrames)) return nbFrames;

  // Tag frames
  const tagFrames = parseInt(
    String(
      Object.entries(videoTrack?.metadata.tags)
        .find(([key]) => key.includes('NUMBER_OF_FRAMES'))
        ?.at(1)
    ) || ''
  );
  if (!isNaN(tagFrames)) return tagFrames;

  // Unknown frames
  return undefined;
}
