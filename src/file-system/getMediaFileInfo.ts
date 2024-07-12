import fs from 'fs/promises';
import { execPromise } from '../utils/execPromise';

/**
 * Extract basic information about a media file.
 * @param file - File path
 * @returns Basic info about media file
 */

export async function getMediaFileInfo(file: string): Promise<{
  /** File size in bytes. */
  size?: number;
  /** Encoding name, if available. */
  encoding?: string;
  /** Video resolution, if available. */
  resolution?: [number, number];
}> {
  let size: number | undefined;
  let encoding: string | undefined;
  let resolution: [number, number] | undefined;

  // Get file size
  try {
    const stats = await fs.stat(file);
    size = stats.size;
  } catch (error) {
    size = undefined;
  }

  // Get video encoding and resolution if it's a media file
  try {
    const { stdout: encodingOutput } = await execPromise(
      `ffprobe -v error -select_streams v:0 -show_entries stream=codec_name -of default=noprint_wrappers=1:nokey=1 "${file}"`
    );
    if (encodingOutput) {
      encoding = encodingOutput.trim();
    }

    const { stdout: resolutionOutput } = await execPromise(
      `ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=s=x:p=0 "${file}"`
    );
    if (resolutionOutput) {
      const [width, height] = resolutionOutput.trim().split('x').map(Number);
      if (width && height) {
        resolution = [width, height];
      }
    }
  } catch (error) {
    // Ignore errors for non-media files or issues with ffprobe
  }

  return { size, encoding, resolution };
}
