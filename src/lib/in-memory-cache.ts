import { Cache } from '../types';

export class InMemoryCache implements Cache {
  data: Map<string, unknown>;

  constructor() {
    this.data = new Map<string, unknown>();
  }

  set(key: string, value: unknown) {
    this.data.set(key, value);
  }

  get(key: string): unknown {
    return this.data.get(key);
  }

  remove(key: string): void {
    this.data.delete(key);
  }

  removeAll(): void {
    this.data.clear();
  }
}
