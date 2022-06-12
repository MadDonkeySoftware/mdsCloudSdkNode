import { EOL } from 'os';

export function verboseWrite(message: any, force = false) {
  if (process.env.MDS_SDK_VERBOSE || force) {
    process.stdout.write(`${message}${EOL}`);
  }
}
