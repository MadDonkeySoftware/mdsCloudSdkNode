import { promisify } from 'util';
import { readFile, PathOrFileDescriptor } from 'fs';

export const promisifiedReadFile = promisify(readFile);

export async function fsReadFile(
  path: PathOrFileDescriptor,
  options?: {
    encoding?: null;
    flag?: string;
  },
): Promise<Buffer> {
  return promisifiedReadFile(path, options);
}
