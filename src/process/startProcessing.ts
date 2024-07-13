import chalk from 'chalk';
import type { AsyncReturnType } from 'type-fest';
import type { selectTracks } from '../tracks/selectTracks';
import { askQuestion } from '../utils/askQuestion';
import { getGraphicsInfo } from './getGraphicsInfo';
import { processFile } from './processFile';

/**
 * Start processing of files.
 * @param files - Array of files
 */

export async function startProcessing(
  files: AsyncReturnType<typeof selectTracks>
): Promise<void> {
  const { encodeVideo } = await askQuestion({
    type: 'select',
    name: 'encodeVideo',
    message: 'Select video encoding option:',
    choices: [
      { title: 'No encoding', value: undefined },
      { title: 'H.264 (AVC)', value: 'h264' },
      { title: 'H.265 (HEVC)', value: 'h265' },
    ],
  });

  const graphics = await getGraphicsInfo();
  const gpuVendor = graphics?.vendor.toLowerCase();
  let useGPU: string | undefined;
  if (encodeVideo && gpuVendor) {
    const { gpuEncoding } = await askQuestion({
      type: 'toggle',
      name: 'gpuEncoding',
      message: `Use GPU (${gpuVendor}) for encoding?`,
      active: 'Yes',
      inactive: 'No',
    });
    if (gpuEncoding) useGPU = gpuVendor;
  }

  const { shouldProcess } = await askQuestion([
    {
      type: 'toggle',
      name: 'shouldProcess',
      message: 'Do you want to proceed with processing?',
      active: 'Yes',
      inactive: 'No',
    },
  ]);

  if (!shouldProcess) {
    console.log(chalk.yellow('Processing aborted by user.'));
    return;
  }

  for (const { file, tracks } of files) {
    await processFile(file, {
      encodeVideo,
      tracks,
      useGPU,
    });
  }
}
