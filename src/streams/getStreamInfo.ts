import Ffmpeg from 'fluent-ffmpeg';
import { getErrorMessage } from '../utils/getErrorMessage';
import type { StreamInfo } from './StreamInfo';

/**
 * Extracts info abou individual streams of a file.
 * @param file - File path
 * @returns Array of streams
 */

export async function getStreamInfo(file: string) {
  return await new Promise<StreamInfo[]>((resolve, reject) => {
    Ffmpeg.ffprobe(file, (error, metadata) => {
      // Failed to probe
      if (error) reject(getErrorMessage(error));
      // No streams
      if (!metadata.streams.length)
        reject(`No valid streams found in ffprobe output for ${file}`);
      // Map information
      resolve(
        metadata.streams.map((stream, _index, arr) => {
          const tracksOfSameType = arr.filter(({ codec_type }) => {
            return codec_type === stream.codec_type;
          });
          return {
            index: tracksOfSameType.length,
            codecName: stream.codec_name,
            language: stream.tags?.language,
            title: stream.tags?.title,
            type: stream.codec_type,
            metadata: stream,
          };
        })
      );
    });
  });
}
