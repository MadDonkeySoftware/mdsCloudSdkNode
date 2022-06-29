import axios from 'axios';
import { VError } from 'verror';
import { EnvironmentUrls } from '../../types/environment-urls';
import { getRequestOptions } from './get-request-options';
import { urlJoin } from './url-join';
import { verboseWrite } from './verbose-write';

/**
 * Gets the auto-configurable URLs for the mdsCloud system.
 * @param identityUrl The url of the identity service
 * @param allowSelfSignCert True to allow consumption of self signed SSL certs; False to deny.
 */
export async function getConfigurationUrls(
  identityUrl?: string,
  allowSelfSignCert = true,
): Promise<EnvironmentUrls> {
  if (!identityUrl) return {};

  const url = urlJoin(identityUrl, 'v1', 'configuration');

  const options = await getRequestOptions({
    allowSelfSignCert,
  });

  try {
    const resp = await axios.get(url, options);
    switch (resp.status) {
      case 200:
        return { ...resp.data };
      default:
        throw new VError(
          {
            info: {
              status: resp.status,
              body: resp.data,
            },
          },
          'An error occurred while acquiring the configuration.',
        );
    }
  } catch (err) {
    /* istanbul ignore if */
    if (process.env.NODE_ENV !== 'test') {
      verboseWrite('=====');
      verboseWrite(
        'WARNING: Encountered error while fetching configuration URLs',
      );
      verboseWrite(err.stack);
      verboseWrite('=====');
    }
    return {};
  }
}
