import os from 'os';
import fs from 'fs';
import { createArchiveFromDirectory } from '../create-archive-from-directory';
import * as wrappers from '../../../wrappers';
import archiver from 'archiver';

jest.mock('fs');
const mockedFs = fs as jest.Mocked<typeof fs>;

jest.mock('os');
const mockedOs = os as jest.Mocked<typeof os>;

jest.mock('../../../wrappers');
const mockedWrappers = wrappers as jest.Mocked<typeof wrappers>;

describe(__filename, () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  describe('createArchiveFromDirectory', () => {
    it('Archival successful', () => {
      // Arrange
      let onCloseCb: CallableFunction;
      let onErrorCb: CallableFunction;
      const outFileStub = {
        on: (event: string, cb: CallableFunction) => {
          if (event === 'close') onCloseCb = cb;
          if (event === 'error') onErrorCb = cb;
        },
        call: (event: string, data: unknown) =>
          event === 'close' ? onCloseCb(data) : onErrorCb(data),
      };
      const archiveStub = {
        finalize: () => outFileStub.call('close', null),
        directory: jest.fn(),
        pipe: jest.fn(),
      } as any as archiver.Archiver;
      mockedWrappers.getArchiver.mockReturnValue(archiveStub);
      mockedFs.createWriteStream.mockImplementation(() => {
        return outFileStub as any as fs.WriteStream;
      });
      mockedOs.tmpdir.mockReturnValue('/tmp');

      // Act
      return createArchiveFromDirectory('/tmp/foo').then((meta) => {
        // Assert
        expect(meta.filePath).toBe('/tmp/foo.zip');
        expect(meta.userSupplied).toBe(false);
      });
    });

    it('Archival failure', () => {
      // Arrange
      let onCloseCb: CallableFunction;
      let onErrorCb: CallableFunction;
      const outFileStub = {
        on: (event: string, cb: CallableFunction) => {
          if (event === 'close') onCloseCb = cb;
          if (event === 'error') onErrorCb = cb;
        },
        call: (event: string, data: unknown) =>
          event === 'close' ? onCloseCb(data) : onErrorCb(data),
      } as any as fs.WriteStream;
      const archiveStub = {
        // finalize: () => outFileStub.call('error', new Error('test error')),
        finalize: () => onErrorCb(new Error('test error')),
        directory: jest.fn(),
        pipe: jest.fn(),
      } as any as archiver.Archiver;
      mockedWrappers.getArchiver.mockReturnValue(archiveStub);
      mockedFs.createWriteStream.mockReturnValue(outFileStub);

      // Act
      return expect(() =>
        createArchiveFromDirectory('/tmp/foo'),
      ).rejects.toEqual(
        expect.objectContaining({
          message: 'test error',
        }),
      );
    });
  });
});
