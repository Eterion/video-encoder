export interface TrackFilter {
  type: 'audio' | 'subtitle';
  index: number;
  language?: string;
  title?: string;
  keep: boolean;
}
