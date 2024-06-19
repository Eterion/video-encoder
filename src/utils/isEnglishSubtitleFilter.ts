import type { TrackFilter } from '../types/TrackFilter';
import { isSubtitleFilter } from './isSubtitleFilter';

export function isEnglishSubtitleFilter(filter: TrackFilter) {
  return isSubtitleFilter(filter) && filter.keep;
}
