import { map } from 'lodash';
import { getEnvConfig } from '../get-env-config';
import * as IN_PROC_CACHE from '../in-proc-cache';
import * as wrappers from '../../../wrappers';

jest.mock('../../../wrappers');
const mockedWrappers = wrappers as jest.Mocked<typeof wrappers>;

describe(__filename, () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  describe('getEnvConfig', () => {
    const testSet = [
      ['empty string', '', null],
      ['undefined', undefined, null],
      ['null', null, null],
    ];
    map(testSet, ([desc, key, expected]) => {
      it(`when ${desc} provided`, async () => {
        // Arrange

        // Act
        const result = await getEnvConfig(key);

        // Assert
        expect(result).toBe(expected);
      });
    });

    it('when cache hits returns cache value', async () => {
      // Arrange
      IN_PROC_CACHE.set('getEnvConfig-testKey', { a: 'a' });

      // Act
      const result = await getEnvConfig('testKey');

      // Assert
      expect(result).toStrictEqual({ a: 'a' });
    });

    it('when cache not hit and env does not exists returns null', async () => {
      // Arrange
      IN_PROC_CACHE.removeAll();
      mockedWrappers.fsExists.mockResolvedValue(false);
      mockedWrappers.fsReadFile.mockRejectedValue(
        new Error('Test Issue: Error should not be thrown'),
      );

      // Act
      const result = await getEnvConfig('testKey');

      // Assert
      expect(result).toStrictEqual(null);
      expect(IN_PROC_CACHE.getCacheState()).toStrictEqual(new Map());
    });

    it('when cache not hit and env exists returns value and loads cache', async () => {
      // Arrange
      IN_PROC_CACHE.removeAll();
      mockedWrappers.fsExists.mockResolvedValue(true);
      mockedWrappers.fsReadFile.mockResolvedValue(Buffer.from('{"a":"a"}'));

      // Act
      const result = await getEnvConfig('testKey');

      // Assert
      expect(result).toStrictEqual({ a: 'a' });
      expect(IN_PROC_CACHE.get('getEnvConfig-testKey')).toStrictEqual({
        a: 'a',
      });
    });

    it('when cache not hit and error occurs loading env returns null', async () => {
      // Arrange
      IN_PROC_CACHE.removeAll();
      mockedWrappers.fsExists.mockResolvedValue(true);
      mockedWrappers.fsReadFile.mockResolvedValue(Buffer.from('{badJson}'));

      // Act
      const result = await getEnvConfig('testKey');

      // Assert
      expect(result).toStrictEqual(null);
    });
  });
});
