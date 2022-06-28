import fs from 'fs';
import axios from 'axios';

import { download } from '../download';

jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  createWriteStream: jest.fn(),
}));
const mockedFs = fs as jest.Mocked<typeof fs>;

describe(__filename, () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  describe('download', () => {
    it('Resolves promise on successful download', () => {
      // Arrange
      const url = 'http://127.0.0.1:8000/download/foo/bar.txt';
      const dest = '/foo/baz';
      const stubAxiosGet = jest.spyOn(axios, 'get');
      const fakeWriter = {
        on: (event: string, listener: CallableFunction) => {
          if (event === 'finish') {
            setTimeout(listener, 1);
          }
        },
      } as any as fs.WriteStream;
      const fakeResponse = {
        data: {
          pipe: jest.fn(),
        },
      };

      mockedFs.createWriteStream.mockReturnValue(fakeWriter);
      stubAxiosGet.mockResolvedValue(fakeResponse);

      // Act
      return download(url, dest, undefined).then(() => {
        // Assert
        expect(mockedFs.createWriteStream).toBeCalledTimes(1);
        expect(mockedFs.createWriteStream.mock.calls[0][0]).toBe(
          '/foo/baz/bar.txt',
        );

        expect(fakeResponse.data.pipe).toBeCalledTimes(1);
        expect(fakeResponse.data.pipe.mock.calls[0][0]).toBe(fakeWriter);
      });
    });
  });
});
