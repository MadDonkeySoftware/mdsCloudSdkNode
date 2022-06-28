import { sep } from 'path';
import { tmpdir } from 'os';
import { getArchiver } from '../../wrappers';
import { createWriteStream } from 'fs';

interface ArchiveCreatedDetails {
  filePath: string;
  userSupplied: boolean;
}

export async function createArchiveFromDirectory(
  folderPath: string,
): Promise<ArchiveCreatedDetails> {
  return new Promise((resolve, reject) => {
    const pathParts = folderPath.split(`${sep}`);
    const tempFilePath = `${tmpdir()}${sep}${
      pathParts[pathParts.length - 1]
    }.zip`;
    const outputFile = createWriteStream(tempFilePath);

    const archive = getArchiver('zip', undefined);
    outputFile.on('close', () => {
      resolve({ filePath: tempFilePath, userSupplied: false });
    });

    outputFile.on('error', (err) => {
      reject(err);
    });

    archive.pipe(outputFile);
    archive.directory(folderPath, false);
    archive.finalize();
  });
}
