import { graphics } from 'systeminformation';

/**
 * Extracts info about first available GPU.
 * @returns Gpu information
 */

export async function getGraphicsInfo() {
  const gpus = (await graphics()).controllers;
  if (!gpus.length) return;
  return gpus[0];
}
