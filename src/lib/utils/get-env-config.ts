import { join } from 'path';
import { homedir } from 'os';
import { fsExists, fsReadFile } from '../../wrappers';
import { verboseWrite } from './verbose-write';
import * as IN_PROC_CACHE from './in-proc-cache';

const SETTING_DIR = join(homedir(), '.mds');

export interface EnvironmentConfig {
  account: string;
  userId: string;
  password: string;
  allowSelfSignCert: boolean;
  identityUrl: string;
  fsUrl: string;
  nsUrl: string;
  qsUrl: string;
  sfUrl: string;
  smUrl: string;
}

/**
 * Gets the configuration for the specified environment
 * @param name The environment configuration to load
 * @returns
 */
export async function getEnvConfig(name: string): Promise<EnvironmentConfig> {
  if (!name) return null;

  try {
    const cacheKey = `getEnvConfig-${name}`;
    const cacheVal = IN_PROC_CACHE.get(cacheKey) as EnvironmentConfig;
    if (cacheVal) {
      return cacheVal;
    }

    const file = join(SETTING_DIR, `${name}.json`);
    const fileExists = await fsExists(file);
    if (fileExists) {
      const body = await await fsReadFile(file);
      const value = JSON.parse(body.toString());
      IN_PROC_CACHE.set(cacheKey, value);
      return value;
    }
  } catch (err) /* istanbul ignore next */ {
    verboseWrite(
      `Attempting to load configuration ${name} from ${SETTING_DIR} failed.`,
    );
    verboseWrite(err);
  }
  return null;
}
