import type { TrackFilter } from '../types/TrackFilter';

export function isSubtitleFilter(filter: TrackFilter) {
  return filter.type === 'subtitle';
}
