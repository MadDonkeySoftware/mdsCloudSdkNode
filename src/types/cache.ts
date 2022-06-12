export interface Cache {
  set(key: string, value: unknown): void;
  get(key: string): unknown;
  remove(key: string): void;
  removeAll(): void;
}
