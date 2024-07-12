import type { StreamInfo } from '../streams/StreamInfo';

export interface TrackInfo extends StreamInfo {
  /** Should this track be kept? */
  keep: boolean;
}
