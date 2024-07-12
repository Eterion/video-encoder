import { getStreamInfo } from './streams/getStreamInfo';
import type { TrackFilter } from './types/TrackFilter';
import { isAudioFilter } from './utils/isAudioFilter';
import { isEnglishSubtitleFilter } from './utils/isEnglishSubtitleFilter';
import { isJapaneseAudioFilter } from './utils/isJapaneseAudioFilter';
import { isSubtitleFilter } from './utils/isSubtitleFilter';

export async function analyzeTracks(file: string): Promise<TrackFilter[]> {
  const streams = await getStreamInfo(file);
  const filters: TrackFilter[] = [];

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
      filters.push({
        type: 'audio',
        codecName: stream.codecName,
        index: stream.index,
        language,
        title: stream.title,
        keep: (isJapanese && notAudioCommentary) || false,
      });
    } else if (stream.type === 'subtitle') {
      const isEnglish =
        language?.includes('en') ||
        language?.includes('eng') ||
        language?.includes('english') ||
        title?.includes('english');
      filters.push({
        type: 'subtitle',
        codecName: stream.codecName,
        index: stream.index,
        language,
        title: stream.title,
        keep: isEnglish || false,
      });
    }
  });

  // If no Japanese audio found, select the first available audio stream
  const foundJapaneseAudio = filters.some(isJapaneseAudioFilter);
  if (!foundJapaneseAudio) {
    const firstAudio = filters.find(isAudioFilter);
    if (firstAudio) {
      firstAudio.keep = true;
    }
  }

  // If no English subtitle found, select the first available subtitle stream
  const foundEnglishSubtitle = filters.some(isEnglishSubtitleFilter);
  if (!foundEnglishSubtitle) {
    const firstSubtitle = filters.find(isSubtitleFilter);
    if (firstSubtitle) {
      firstSubtitle.keep = true;
    }
  }

  return filters;
}
