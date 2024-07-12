import { graphics } from 'systeminformation';

export async function getGPUVendor() {
  const gpus = (await graphics()).controllers;
  if (gpus.length === 0) return;
  for (const gpu of gpus) {
    if (gpu.vendor.toLowerCase().includes('nvidia')) {
      return 'nvidia';
    } else if (gpu.vendor.toLowerCase().includes('amd')) {
      return 'amd';
    }
  }
}
