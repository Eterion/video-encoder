import type { TrackInfo } from './TrackInfo';

/**
 * Filter for subtitle tracks.
 * @param trackInfo - Track info
 * @returns `true` for subtitle tracks
 */

export function isSubtitleTrack(trackInfo: TrackInfo) {
  return trackInfo.type === 'subtitle';
}
