import { createWriteStream } from 'fs';
import { join } from 'path';
import axios from 'axios';
import { AuthManager } from '../auth-manager';
import { getRequestOptions } from './get-request-options';

export async function download(
  url: string,
  destination: string | undefined,
  authManager: AuthManager,
) {
  const parts = url.split('/');
  const fullDestination = join(destination, parts[parts.length - 1]);
  const writer = createWriteStream(fullDestination);

  const options = await getRequestOptions({ authManager });
  const resp = await axios.get(url, { responseType: 'stream', ...options });
  resp.data.pipe(writer);
  return new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
}
