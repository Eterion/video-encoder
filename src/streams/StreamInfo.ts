import type { FfprobeStream } from 'fluent-ffmpeg';

export interface StreamInfo {
  /** Index number. */
  index: number;
  /** Encoding name (flac, aac). */
  codecName?: string;
  /** Stream language (eng, jpn). */
  language?: string;
  /** Full stream metadata. */
  metadata: FfprobeStream;
  /** Stream name. */
  title?: string;
  /** Type of stream (audio, video, subtitle). */
  type?: string;
}
