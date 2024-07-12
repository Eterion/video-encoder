/**
 * Format video `with` and `height` to readable resolution.
 * @param dimensions - Dimensions
 * @returns Formatted resolution
 */

export function formatVideoResolution([width, height]: [
  number,
  number
]): string {
  if (width >= 3840 && height >= 2160) {
    return '4K';
  } else if (width >= 2560 && height >= 1440) {
    return '1440p';
  } else if (width >= 1920 && height >= 1080) {
    return '1080p';
  } else if (width >= 1280 && height >= 720) {
    return '720p';
  } else if (width >= 854 && height >= 480) {
    return '480p';
  } else if (width >= 640 && height >= 360) {
    return '360p';
  } else {
    return `${width}x${height}`;
  }
}
