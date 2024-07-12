/**
 * Extracts a message from an error.
 * @param error - Error
 * @returns Error message
 */

export function getErrorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : typeof error === 'string'
    ? error
    : JSON.stringify(error);
}
