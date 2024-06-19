import { exec } from 'child_process';
import type { StreamInfo } from './types/StreamInfo';

interface RawStreamInfo {
  index: number;
  codec_type: string;
  tags?: {
    language?: string;
    title?: string;
  };
}

export async function analyzeFile(file: string): Promise<StreamInfo[]> {
  return new Promise((resolve, reject) => {
    const ffprobeCommand = `ffprobe -v error -show_entries stream=index,codec_type:stream_tags=language,title -of json "${file}"`;

    exec(ffprobeCommand, (error, stdout, stderr) => {
      if (error) {
        reject(`Error analyzing ${file}: ${error.message}`);
        return;
      }
      if (stderr) {
        reject(`ffprobe stderr analyzing ${file}: ${stderr}`);
        return;
      }

      try {
        const data = JSON.parse(stdout);
        if (!data.streams || !Array.isArray(data.streams)) {
          reject(`No valid streams found in ffprobe output for ${file}`);
          return;
        }

        const streams = (data.streams as RawStreamInfo[]).reduce<StreamInfo[]>(
          (arr, stream) => {
            const existingTracks = arr.filter(({ codecType }) => {
              return codecType === stream.codec_type;
            });
            arr.push({
              index: existingTracks.length,
              codecType: stream.codec_type,
              language: stream.tags?.language,
              title: stream.tags?.title,
            });
            return arr;
          },
          []
        );

        resolve(streams);
      } catch (parseError: any) {
        reject(
          `Error parsing ffprobe output for ${file}: ${
            (parseError as Error).message
          }`
        );
      }
    });
  });
}
