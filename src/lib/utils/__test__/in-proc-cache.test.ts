import * as IN_PROC_CACHE from '../in-proc-cache';

describe(__filename, () => {
  beforeAll(() => {
    IN_PROC_CACHE.removeAll();
  });

  afterAll(() => {
    IN_PROC_CACHE.removeAll();
  });

  it('Test in-proc cache', () => {
    // Act & Assert
    expect(IN_PROC_CACHE.getCacheState()).toStrictEqual(new Map());

    expect(IN_PROC_CACHE.get('missingKey')).toBe(undefined);

    const data = { a: 1 };
    expect(IN_PROC_CACHE.set('testKey', data)).toBe(undefined);
    expect(IN_PROC_CACHE.get('testKey')).toBe(data);
    expect(IN_PROC_CACHE.remove('testKey')).toBe(undefined);
    expect(IN_PROC_CACHE.get('testKey')).toBe(undefined);

    expect(IN_PROC_CACHE.getCacheState()).toStrictEqual(new Map());
  });
});
