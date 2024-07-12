export interface StreamInfo {
  /** Index number. */
  index: number;
  /** Encoding name (flac, aac). */
  codecName?: string;
  /** Stream language (eng, jpn). */
  language?: string;
  /** Stream name. */
  title?: string;
  /** Type of stream (audio, video, subtitle). */
  type: 'audio' | 'subtitle' | 'video';
}
