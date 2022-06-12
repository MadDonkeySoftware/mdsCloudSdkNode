import { homedir } from 'os';
import { join } from 'path';
import * as IN_PROC_CACHE from './in-proc-cache';

const envFileName = 'selectedEnv';
const SETTING_DIR = join(homedir(), '.mds');
import { fsExists, fsReadFile } from '../../wrappers';

/**
 * Gets the configured default environment name for the system.
 */
export async function getDefaultEnv(): Promise<string> {
  const cacheKey = 'getDefaultEnv';
  const cacheVal = IN_PROC_CACHE.get(cacheKey);
  if (cacheVal) {
    return cacheVal as string;
  }

  const file = join(SETTING_DIR, envFileName);
  if (await fsExists(file)) {
    const data = (await fsReadFile(file)).toString();
    if (data) {
      // Trim just in case the file was edited by the user.
      const trimmedData = data.toString().trim();
      IN_PROC_CACHE.set(cacheKey, trimmedData);
      return trimmedData;
    }
  }

  return 'default';
}
