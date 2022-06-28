import { promisify } from 'util';
import { access, constants, PathLike } from 'fs';

// TODO: Update from 'fs' to 'fs/promises'
export const promisifiedAccess = promisify(access);

export async function fsExists(path: PathLike): Promise<boolean> {
  try {
    await promisifiedAccess(path, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}
