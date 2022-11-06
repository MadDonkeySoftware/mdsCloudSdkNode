import * as wrappers from '../../../wrappers';
import { getDefaultEnv } from '../get-default-env';
import * as IN_PROC_CACHE from '../in-proc-cache';

jest.mock('../../../wrappers');
const mockedWrappers = wrappers as jest.Mocked<typeof wrappers>;

describe(__filename, () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  describe('getDefaultEnv', () => {
    it('when file does not exists returns a default', async () => {
      // Arrange
      IN_PROC_CACHE.removeAll();
      mockedWrappers.fsExists.mockResolvedValue(false);
      mockedWrappers.fsReadFile.mockRejectedValue(
        'Test Failure: Should never be thrown',
      );

      // Act
      const result = await getDefaultEnv();

      // Assert
      expect(result).toBe('default');
      expect(IN_PROC_CACHE.getCacheState()).toStrictEqual(new Map());
    });

    it('when file exists but has no data returns a default', async () => {
      // Arrange
      IN_PROC_CACHE.removeAll();
      mockedWrappers.fsExists.mockResolvedValue(true);
      mockedWrappers.fsReadFile.mockResolvedValue(Buffer.from(''));

      // Act
      const result = await getDefaultEnv();

      // Assert
      expect(result).toBe('default');
      expect(IN_PROC_CACHE.getCacheState()).toStrictEqual(new Map());
    });

    it('when file exists returns the default configured environment', async () => {
      // Arrange
      IN_PROC_CACHE.removeAll();
      mockedWrappers.fsExists.mockResolvedValue(true);
      mockedWrappers.fsReadFile.mockResolvedValue(Buffer.from('testDefault'));

      // Act
      const result = await getDefaultEnv();

      // Assert
      expect(result).toBe('testDefault');
      expect(IN_PROC_CACHE.getCacheState()).toStrictEqual(
        new Map([['getDefaultEnv', 'testDefault']]),
      );
    });

    it('when called multiple times uses cache value', async () => {
      // Arrange
      IN_PROC_CACHE.removeAll();
      mockedWrappers.fsExists.mockResolvedValue(true);
      mockedWrappers.fsReadFile.mockResolvedValue(Buffer.from('testDefault'));

      // Act
      const result = await getDefaultEnv();
      const result2 = await getDefaultEnv();

      // Assert
      expect(result2).toBe(result);
      expect(IN_PROC_CACHE.getCacheState()).toStrictEqual(
        new Map([['getDefaultEnv', result]]),
      );
      expect(mockedWrappers.fsExists).toHaveBeenCalledTimes(1);
    });
  });
});
