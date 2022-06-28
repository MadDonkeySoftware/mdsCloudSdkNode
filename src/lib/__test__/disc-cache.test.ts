import fs from 'fs';
import { DiscCache } from '..';

jest.mock('fs');
const mockedFs = fs as jest.Mocked<typeof fs>;

describe(__filename, () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  describe('get/set operations', () => {
    it('One set followed by one get return correct result', () => {
      // Arrange
      const expected = { foo: 'bar' };
      const cache = new DiscCache();

      // Act
      cache.set('testKey', expected);
      const underTest = cache.get('testKey');

      // Assert
      expect(underTest).toStrictEqual(expected);
    });

    it('Set creates cache file when it does not exist.', () => {
      // Arrange
      const expected = { foo: 'bar' };
      const cache = new DiscCache();
      mockedFs.existsSync.mockReturnValue(false);

      // Act
      cache.set('testKey', expected);
      const underTest = cache.get('testKey');

      // Assert
      expect(underTest).toStrictEqual(expected);
    });

    it('Get on non-existent key returns undefined', () => {
      // Arrange
      const cache = new DiscCache();

      // Act
      const underTest = cache.get('testKey');

      // Assert
      expect(underTest).toStrictEqual(undefined);
    });

    it('Get on existent-on-disc key returns value', () => {
      // Arrange
      const cache = new DiscCache();
      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readFileSync.mockReturnValue(JSON.stringify({ testKey: 'foo' }));

      // Act
      const underTest = cache.get('testKey');

      // Assert
      expect(underTest).toBe('foo');
    });

    it('Get on empty-on-disc-cache key returns undefined', () => {
      // Arrange
      const cache = new DiscCache();
      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readFileSync.mockReturnValue('');

      // Act
      const underTest = cache.get('testKey');

      // Assert
      expect(underTest).toBe(undefined);
    });

    it('Two sets on single key followed by one get return correct result', () => {
      // Arrange
      const expected = { foo: 'bar' };
      const cache = new DiscCache();

      // Act
      cache.set('testKey', { foo: 'baz' });
      cache.set('testKey', expected);
      const underTest = cache.get('testKey');

      // Assert
      expect(underTest).toStrictEqual(expected);
    });

    it('Two sets on different keys followed by gets return correct results', () => {
      // Arrange
      const expected1 = { foo: 'bar' };
      const expected2 = { foo: 'baz' };
      const cache = new DiscCache();

      // Act
      cache.set('testKey1', expected1);
      cache.set('testKey2', expected2);
      const underTest1 = cache.get('testKey1');
      const underTest2 = cache.get('testKey2');

      // Assert
      expect(underTest1).toStrictEqual(expected1);
      expect(underTest2).toStrictEqual(expected2);
    });
  });

  describe('remove/removeAll operations', () => {
    it('Remove causes keys value to be undefined', () => {
      // Arrange
      const cache = new DiscCache();

      // Act
      cache.set('testKey', { foo: 'bar' });
      cache.remove('testKey');
      const underTest = cache.get('testKey');

      // Assert
      expect(underTest).toStrictEqual(undefined);
    });

    it('Remove on one key does not affect other keys', () => {
      // Arrange
      const expected = { foo: 'bar' };
      const cache = new DiscCache();

      // Act
      cache.set('testKey', expected);
      cache.set('testKey2', { foo: 'baz' });
      cache.remove('testKey2');
      const underTest1 = cache.get('testKey');
      const underTest2 = cache.get('testKey2');

      // Assert
      expect(underTest1).toStrictEqual(expected);
      expect(underTest2).toStrictEqual(undefined);
    });

    it('RemoveAll removes all set keys', () => {
      // Arrange
      const cache = new DiscCache();

      // Act
      cache.set('testKey1', { foo: 'bar' });
      cache.set('testKey2', { foo: 'baz' });
      cache.removeAll();
      const underTest1 = cache.get('testKey1');
      const underTest2 = cache.get('testKey2');

      // Assert
      expect(underTest1).toStrictEqual(undefined);
      expect(underTest2).toStrictEqual(undefined);
    });
  });
});
