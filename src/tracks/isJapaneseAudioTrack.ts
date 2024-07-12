import { isAudioTrack } from '../tracks/isAudioTrack';
import type { TrackInfo } from '../tracks/TrackInfo';

/**
 * Filter for japanese audio tracks.
 * @param trackInfo - Track info
 * @returns `true` for japanese audio tracks
 */

export function isJapaneseAudioTrack(trackInfo: TrackInfo) {
  return isAudioTrack(trackInfo) && trackInfo.keep;
}
