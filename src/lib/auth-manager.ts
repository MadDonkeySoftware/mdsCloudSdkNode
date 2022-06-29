import { VError } from 'verror';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import https from 'https';
import { getRequestOptions, verboseWrite, urlJoin } from './utils';
import { IdentityJwtPayload } from '../types';
import { Cache } from '../types';

const getNewToken = async ({
  identityUrl,
  accountId,
  userId,
  password,
  allowSelfSignCert,
}: {
  identityUrl: string;
  accountId: string;
  userId: string;
  password: string;
  allowSelfSignCert: boolean;
}): Promise<string> => {
  const url = urlJoin(identityUrl, 'v1', 'authenticate');
  const body = {
    accountId,
    userId,
    password,
  };

  const options = await getRequestOptions();

  if (allowSelfSignCert) {
    options.httpsAgent = new https.Agent({
      rejectUnauthorized: false,
    });
  }

  return axios.post(url, body, options).then((resp) => {
    switch (resp.status) {
      case 200:
        return resp.data.token;
      default:
        throw new VError(
          {
            info: {
              status: resp.status,
              body: resp.data,
            },
          },
          'An error occurred while authenticating.',
        );
    }
  });
};

export class AuthManager {
  cache: Cache;
  identityUrl: string;
  userId: string;
  password: string;
  account: string;
  allowSelfSignCert: boolean;

  constructor({
    cache,
    identityUrl,
    userId,
    password,
    account,
    allowSelfSignCert,
  }: {
    cache?: Cache;
    identityUrl?: string;
    userId?: string;
    password?: string;
    account?: string;
    allowSelfSignCert?: boolean;
  } = {}) {
    this.cache = cache;
    this.identityUrl = identityUrl;
    this.userId = userId;
    this.password = password;
    this.account = account;
    this.allowSelfSignCert = allowSelfSignCert;
  }

  /**
   * Gets a valid token for the given account
   * @param meta The login details
   * @param meta.accountId The account to authenticate with
   * @param meta.userId The email/userId to authenticate with
   * @param meta.password The password to authenticate with
   */
  async getAuthenticationToken({
    accountId,
    userId,
    password,
  }: {
    accountId?: string;
    userId?: string;
    password?: string;
  } = {}): Promise<string> {
    const account = accountId || this.account;
    const user = userId || this.userId;
    const passwd = password || this.password;

    const cacheKey = `${this.identityUrl}|${account}|${user}`;
    const existingToken = this.cache.get(cacheKey) as string;
    if (existingToken) {
      verboseWrite('AuthManager: Existing token found');
      const payload = jwt.decode(existingToken) as IdentityJwtPayload;

      // TODO: Validate token
      // NOTE: Add a 60 second buffer to ensure calls will succeed.
      const nowSec = Math.floor(new Date().getTime() / 1000.0) + 60;
      if (payload && payload.exp && nowSec < payload.exp) {
        verboseWrite('AuthManager: Existing token deemed valid.');
        return existingToken;
      }
      verboseWrite('AuthManager: Existing token invalid. Removing from cache.');
      this.cache.remove(cacheKey);
    }

    const token = await getNewToken({
      identityUrl: this.identityUrl,
      accountId: account,
      userId: user,
      password: passwd,
      allowSelfSignCert: this.allowSelfSignCert,
    });
    await this.setAuthenticationToken(token);
    return token;
  }

  async setAuthenticationToken(token: string) {
    const payload = jwt.decode(token) as IdentityJwtPayload;
    const { accountId, userId } = payload;
    // We "seed" these for when the mds sdk is configured via the docker minion
    this.account = accountId;
    this.userId = userId;
    const cacheKey = `${this.identityUrl}|${accountId}|${userId}`;
    this.cache.set(cacheKey, token);
  }
}
