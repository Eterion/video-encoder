import { exec } from 'child_process';
import { promisify } from 'util';
import { getErrorMessage } from '../utils/getErrorMessage';
import type { StreamInfo } from './StreamInfo';

const execPromise = promisify(exec);

interface OutStream {
  index: number;
  codec_type: string;
  codec_name?: string;
  tags?: {
    language?: string;
    title?: string;
  };
}

/**
 * Checks if value is array of output streams.
 * @param streams - Streams data
 * @returns Type guard of {@link OutStream}
 */

function isStreamsArray(streams: unknown): streams is OutStream[] {
  return !!streams && Array.isArray(streams);
}

/**
 * Extracts info abou individual streams of a file.
 * @param file - File path
 * @returns Array of streams
 */

export async function getStreamInfo(file: string): Promise<StreamInfo[]> {
  const ffprobe = `ffprobe -v error -show_entries stream=index,codec_type,codec_name:stream_tags=language,title -of json "${file}"`;

  try {
    const { stdout, stderr } = await execPromise(ffprobe);

    // Failed to analyze
    if (stderr) throw Error(`ffprobe stderr analyzing ${file}: ${stderr}`);

    // Fails to find valid streams
    const data = JSON.parse(stdout).streams;
    if (!isStreamsArray(data))
      throw Error(`No valid streams found in ffprobe output for ${file}`);

    // Put valid streams into array
    const streams = data.reduce<StreamInfo[]>((arr, stream) => {
      const tracksOfSameType = arr.filter(({ type }) => {
        return type === stream.codec_type;
      });
      arr.push({
        index: tracksOfSameType.length,
        codecName: stream.codec_name,
        language: stream.tags?.language,
        title: stream.tags?.title,
        type: stream.codec_type,
      });
      return arr;
    }, []);

    return streams;
  } catch (error) {
    throw Error(`Error analyzing ${file}: ${getErrorMessage(error)}`);
  }
}
