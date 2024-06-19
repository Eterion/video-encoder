import type { TrackFilter } from '../types/TrackFilter';
import { isAudioFilter } from './isAudioFilter';

export function isJapaneseAudioFilter(filter: TrackFilter) {
  return isAudioFilter(filter) && filter.keep;
}
