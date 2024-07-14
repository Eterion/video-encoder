interface Output {
  [key: string]: string | number;
}

/**
 * Extracts object from ffmpeg line output.
 * @param line - Output line
 * @returns Object
 */

export function parseOutput(line: string): Output {
  const output: Output = {};
  const regex = /(\w+)=\s*([^\s]+)(?=\s+\w+=|$)/g;
  let match;

  while ((match = regex.exec(line)) !== null) {
    const key = match[1];
    const value = match[2];
    output[key] = isNaN(Number(value)) ? value : Number(value);
  }

  return output;
}
