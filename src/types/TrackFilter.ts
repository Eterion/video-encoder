export interface TrackFilter {
  type: 'audio' | 'subtitle';
  codecName?: string;
  index: number;
  language?: string;
  title?: string;
  keep: boolean;
}
