import path from 'path';
import type { TrackInfo } from '../tracks/TrackInfo';
import { isEnglishSubtitleTrack } from '../tracks/isEnglishSubtitleTrack';
import { isJapaneseAudioTrack } from '../tracks/isJapaneseAudioTrack';

/**
 * Creates the processing command for a file.
 * @param file - File path
 * @param options - Options
 * @returns Processing command (ffmpeg)
 */

export function createProcessingCommand(
  file: string,
  {
    encodeVideo,
    outputFolder,
    tracks,
    useGPU,
  }: {
    /** Video encoding type. */
    encodeVideo?: string;
    /** Output folder path. */
    outputFolder: string;
    /** Tracks information. */
    tracks: TrackInfo[];
    /** Use gpu encoding instead of software encoding. */
    useGPU?: string;
  }
): string {
  const params: string[] = [];

  params.push('-map 0:v');
  switch (encodeVideo) {
    case 'h264':
      switch (useGPU) {
        case 'nvidia':
          params.push(
            '-c:v h264_nvenc -preset slow -rc vbr -cq 18 -b:v 2M -maxrate 5M -tune animation'
          );
          break;
        case 'amd':
          params.push('-c:v h264_amf -quality slow -cq 18 -tune animation');
          break;
        default:
          params.push(
            '-c:v libx264 -preset slow -crf 18 -tune animation -x264-params "aq-mode=3:aq-strength=0.8"'
          );
          break;
      }
      break;
    case 'h265':
      switch (useGPU) {
        case 'nvidia':
          params.push(
            '-c:v hevc_nvenc -preset slow -rc vbr -cq 18 -b:v 2M -maxrate 5M'
          );
          break;
        case 'amd':
          params.push('-c:v hevc_amf -quality slow -cq 18');
          break;
        default:
          params.push(
            '-c:v libx265 -preset slow -crf 18 -x265-params "limit-sao:bframes=8:psy-rd=1.5:psy-rdoq=2:aq-mode=3"'
          );
          break;
      }
      break;
    default:
      params.push('-c:v copy'); // Copy video stream without encoding
      break;
  }

  const audioTracks = tracks.filter(isJapaneseAudioTrack);
  if (audioTracks.length > 0)
    audioTracks.forEach((track, index) => {
      params.push(`-map 0:a:${track.index}`);
      params.push(
        track.codecName === 'flac'
          ? `-c:a:${index} libopus -b:a:${index} 192k -vbr:${index} on -compression_level:${index} 10`
          : `-c:a:${index} copy` // Copy audio stream without encoding
      );
      if (track.language !== 'jpn')
        params.push(`-metadata:s:a:${index} language=jpn`);
      if (index === 0) params.push(`-disposition:a:${index} default`);
    });

  const subtitleTracks = tracks.filter(isEnglishSubtitleTrack);
  if (subtitleTracks.length > 0)
    subtitleTracks.forEach((track, index) => {
      params.push(`-map 0:s:${track.index}`);
      params.push(`-c:s:${index} copy`); // Copy subtitle streams without encoding
      if (track.language !== 'eng')
        params.push(`-metadata:s:s:${index} language=eng`);
      if (index === 0) params.push(`-disposition:s:${index} default`);
    });

  // Include chapters
  params.push('-map_chapters 0');

  // Include attachments
  params.push('-map 0:t');

  const outputFileName = path.basename(file);
  const outputPath = path.join(outputFolder, outputFileName);
  return `ffmpeg -i "${file}" ${params.join(' ')} -y "${outputPath}"`;
}
