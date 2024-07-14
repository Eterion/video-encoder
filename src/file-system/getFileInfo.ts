import Ffmpeg from 'fluent-ffmpeg';

/**
 * Extract basic information about a media file.
 * @param file - File path
 * @returns Basic info about media file
 */

export async function getFileInfo(file: string) {
  return await new Promise<{
    /** File size in bytes. */
    size?: number;
    /** Encoding name, if available. */
    encoding?: string;
    /** Video resolution, if available. */
    resolution?: [number, number];
  }>((resolve) => {
    Ffmpeg.ffprobe(file, (_error, metadata) => {
      const videoStream = metadata.streams.find(
        ({ codec_type }) => codec_type === 'video'
      );
      const width = videoStream?.width;
      const height = videoStream?.height;
      resolve({
        size: metadata.format.size,
        encoding: videoStream?.codec_name,
        resolution:
          width !== undefined && height !== undefined
            ? [width, height]
            : undefined,
      });
    });
  });
}
