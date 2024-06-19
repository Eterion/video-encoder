import { exec } from 'child_process';

export async function getPartitionDrives(): Promise<string[]> {
  return new Promise<string[]>((resolve, reject) => {
    exec('wmic logicaldisk get caption', (err, stdout, stderr) => {
      if (err) {
        reject(err);
        return;
      }

      if (stderr) {
        reject(new Error(stderr));
        return;
      }

      // Split stdout into lines and filter out non-drive lines
      const lines = stdout.trim().split(/\s+/);
      const drives = lines.filter((line) => /^[A-Za-z]:$/.test(line));
      resolve(drives);
    });
  });
}
