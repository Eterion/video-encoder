import type { TrackFilter } from '../types/TrackFilter';

export function isAudioFilter(filter: TrackFilter) {
  return filter.type === 'audio';
}
