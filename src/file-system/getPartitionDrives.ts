import { execPromise } from '../utils/execPromise';

/**
 * Extract system partition drives.
 * @returns Array of drive letters
 */

export async function getPartitionDrives(): Promise<string[]> {
  const { stdout, stderr } = await execPromise('wmic logicaldisk get caption');

  // Failed to get drives
  if (stderr) throw Error(stderr);

  // Split stdout into lines and filter out non-drive lines
  const lines = stdout.trim().split(/\s+/);
  const drives = lines.filter((line) => /^[A-Za-z]:$/.test(line));
  return drives;
}
