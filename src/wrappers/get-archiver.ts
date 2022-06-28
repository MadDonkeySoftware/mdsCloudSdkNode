import archiver, { Format, ArchiverOptions } from 'archiver';

export function getArchiver(format: Format, options?: ArchiverOptions) {
  return archiver(format, options);
}
