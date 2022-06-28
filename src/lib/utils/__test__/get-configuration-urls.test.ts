import axios from 'axios';
import { getConfigurationUrls } from '../get-configuration-urls';

describe(__filename, () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  describe('getConfigurationUrls', () => {
    it('No url provided yields empty object', async () => {
      // Act
      const result = await getConfigurationUrls();

      // Assert
      expect(result).toStrictEqual({});
    });

    it('Valid url and response yields configured object', async () => {
      // Arrange
      jest.spyOn(axios, 'get').mockResolvedValue({
        status: 200,
        data: {
          foo: '1',
        },
      });

      // Act
      const result = await getConfigurationUrls('http://test-url');

      // Assert
      expect(result).toStrictEqual({ foo: '1' });
    });

    it('Valid url and invalid response yields error', async () => {
      // Arrange
      jest.spyOn(axios, 'get').mockResolvedValue({
        status: 400,
        data: '400 from test',
      });

      // Act
      const result = await getConfigurationUrls('http://test-url');
      expect(result).toStrictEqual({});
    });
  });
});
