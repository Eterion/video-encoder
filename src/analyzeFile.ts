import { exec } from 'child_process';
import { promisify } from 'util';
import type { StreamInfo } from './types/StreamInfo';

const execPromise = promisify(exec);

interface RawStreamInfo {
  index: number;
  codec_type: string;
  codec_name?: string;
  tags?: {
    language?: string;
    title?: string;
  };
}

export async function analyzeFile(file: string): Promise<StreamInfo[]> {
  const ffprobeCommand = `ffprobe -v error -show_entries stream=index,codec_type,codec_name:stream_tags=language,title -of json "${file}"`;

  try {
    const { stdout, stderr } = await execPromise(ffprobeCommand);

    if (stderr) {
      throw new Error(`ffprobe stderr analyzing ${file}: ${stderr}`);
    }

    const data = JSON.parse(stdout);
    if (!data.streams || !Array.isArray(data.streams)) {
      throw new Error(`No valid streams found in ffprobe output for ${file}`);
    }

    const streams = (data.streams as RawStreamInfo[]).reduce<StreamInfo[]>(
      (arr, stream) => {
        const existingTracks = arr.filter(({ codecType }) => {
          return codecType === stream.codec_type;
        });
        arr.push({
          index: existingTracks.length,
          codecType: stream.codec_type,
          codecName: stream.codec_name,
          language: stream.tags?.language,
          title: stream.tags?.title,
        });
        return arr;
      },
      []
    );

    return streams;
  } catch (error: any) {
    throw new Error(`Error analyzing ${file}: ${error.message}`);
  }
}
