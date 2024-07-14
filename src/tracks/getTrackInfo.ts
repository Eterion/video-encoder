import { getStreamInfo } from '../streams/getStreamInfo';
import { isAudioTrack } from './isAudioTrack';
import { isEnglishSubtitleTrack } from './isEnglishSubtitleTrack';
import { isJapaneseAudioTrack } from './isJapaneseAudioTrack';
import { isSubtitleTrack } from './isSubtitleTrack';
import type { TrackInfo } from './TrackInfo';

/**
 * Extracts info about individual tracks of a media file.
 * @param file  - File path
 * @returns Array of tracks
 */

export async function getTrackInfo(file: string): Promise<TrackInfo[]> {
  const streams = await getStreamInfo(file);
  const tracks: TrackInfo[] = [];

  streams.forEach((stream) => {
    const language = stream.language?.toLowerCase();
    const title = stream.title?.toLowerCase();

    if (stream.type === 'audio') {
      const isJapanese =
        language?.includes('ja') ||
        language?.includes('jpn') ||
        language?.includes('japanese') ||
        title?.includes('japanese');
      const notAudioCommentary = !title?.includes('comment');
      tracks.push({
        ...stream,
        language,
        keep: (isJapanese && notAudioCommentary) || false,
      });
    } else if (stream.type === 'subtitle') {
      const isEnglish =
        language?.includes('en') ||
        language?.includes('eng') ||
        language?.includes('english') ||
        title?.includes('english');
      tracks.push({
        ...stream,
        language,
        keep: isEnglish || false,
      });
    }
  });

  // If no Japanese audio found, keep the first available audio stream
  const foundJapaneseAudio = tracks.some(isJapaneseAudioTrack);
  if (!foundJapaneseAudio) {
    const firstAudio = tracks.find(isAudioTrack);
    if (firstAudio) {
      firstAudio.keep = true;
    }
  }

  // If no English subtitle found, keep the first available subtitle stream
  const foundEnglishSubtitle = tracks.some(isEnglishSubtitleTrack);
  if (!foundEnglishSubtitle) {
    const firstSubtitle = tracks.find(isSubtitleTrack);
    if (firstSubtitle) {
      firstSubtitle.keep = true;
    }
  }

  return tracks;
}
