import { merge } from 'lodash';
import { Agent } from 'https';
import { AuthManager } from '../auth-manager';
import { getEnvConfig } from '.';
import { EnvironmentConfiguration } from '../../types';
import { Headers } from 'form-data';

const DEFAULT_OPTIONS = {
  headers: {
    'Content-Type': 'application/json',
  },

  // Don't reject on any request. This causes promises to always resolve even if the server returns non-2XX status code.
  validateStatus: () => true,
};

interface CustomRequestOptions {
  headers: Record<string, string>;
  httpsAgent?: Agent;
}

/**
 *
 * @param obj Object to capture overridable portions of the request options
 * @param obj.envName Environment to act against
 * @param obj.headers Object to capture various request headers and value
 * @param obj.authManager TODO
 * @param obj.allowSelfSignCert Allows communication with services using self signed certs
 */
export async function getRequestOptions({
  envName,
  headers,
  authManager,
  allowSelfSignCert,
}: {
  envName?: string;
  headers?: Headers;
  authManager?: AuthManager;
  allowSelfSignCert?: boolean;
} = {}): Promise<any> {
  const preBaked: CustomRequestOptions = {
    headers: {},
  };

  if (authManager) {
    let token: string;
    if (envName) {
      const conf = (await getEnvConfig(envName)) as EnvironmentConfiguration;
      token = await authManager.getAuthenticationToken({
        accountId: conf.account,
        userId: conf.userId,
        password: conf.password,
      });
    } else {
      token = await authManager.getAuthenticationToken();
    }
    preBaked.headers['Token'] = token;
  }

  if (allowSelfSignCert) {
    preBaked.httpsAgent = new Agent({
      rejectUnauthorized: false,
    });
  }

  return merge({}, DEFAULT_OPTIONS, preBaked, { headers });
}
