import { homedir } from 'os';
import { join } from 'path';
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'fs';
import { TSMap } from 'typescript-map';
import { Cache } from '../types';

const settingDir = join(homedir(), '.mds');
const CACHE_FILE_NAME = 'cache';

const writeCache = (data: TSMap<string, unknown>) => {
  const cacheFile = join(settingDir, CACHE_FILE_NAME);
  if (!existsSync(settingDir)) mkdirSync(settingDir);
  writeFileSync(cacheFile, JSON.stringify(data.toJSON()));
};

export class DiscCache implements Cache {
  data: TSMap<string, unknown>;

  constructor() {
    this.data = new TSMap<string, unknown>();
  }

  set(key: string, value: unknown): void {
    this.data.set(key, value);
    writeCache(this.data);
  }

  get(key: string): unknown {
    const cacheFile = join(settingDir, CACHE_FILE_NAME);
    if (!this.data.get(key) && existsSync(cacheFile)) {
      const data = readFileSync(cacheFile).toString();
      if (data) {
        this.data.fromJSON(JSON.parse(data));
      }
    }

    return this.data.get(key);
  }

  remove(key: string): void {
    this.data.delete(key);
    writeCache(this.data);
  }

  removeAll(): void {
    this.data.clear();
    writeCache(this.data);
  }
}
