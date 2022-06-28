import { InMemoryCache } from '../in-memory-cache';

const CACHE = new InMemoryCache();

export function get(key: string) {
  return CACHE.get(key);
}

export function remove(key: string) {
  CACHE.remove(key);
}

export function removeAll() {
  CACHE.removeAll();
}

export function set(key: string, value: unknown) {
  CACHE.set(key, value);
}

export function getCacheState(): object {
  return CACHE.data;
}
