import type { TrackInfo } from './TrackInfo';

/**
 * Filter for audio tracks.
 * @param trackInfo - Track info
 * @returns `true` for audio tracks
 */

export function isAudioTrack(trackInfo: TrackInfo) {
  return trackInfo.type === 'audio';
}
