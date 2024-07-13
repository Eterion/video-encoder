import { blockDevices } from 'systeminformation';

/**
 * Extract system partition drives.
 * @returns Array of drive letters
 */

export async function getPartitionDrives(): ReturnType<typeof blockDevices> {
  return await blockDevices();
}
