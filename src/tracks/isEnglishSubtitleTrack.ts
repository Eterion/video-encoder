import type { TrackInfo } from './TrackInfo';
import { isSubtitleTrack } from './isSubtitleTrack';

/**
 * Filter for english subtitle tracks.
 * @param trackInfo - Track info
 * @returns `true` for english subtitle tracks
 */

export function isEnglishSubtitleTrack(trackInfo: TrackInfo) {
  return isSubtitleTrack(trackInfo) && trackInfo.keep;
}
