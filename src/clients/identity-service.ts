import axios from 'axios';
import { VError } from 'verror';
import { AuthManager } from '../lib';
import { getRequestOptions, urlJoin } from '../lib/utils';
import {
  ImpersonationResult,
  PublicSignatureResponse,
  RegisterResult,
} from '../types/identity-service';

export class IdentityServiceClient {
  private _serviceUrl: string;
  private authManager?: AuthManager;
  private allowSelfSignCert: boolean;

  /**
   * Initializes a new instance of the Queue Service client.
   *
   * @param serviceUrl The url base that this client should use for service communication.
   * @param authManager The authentication manager to use for certain requests.
   * @param allowSelfSignCert Allows this client to accept self signed certificates.
   */
  constructor(
    serviceUrl: string,
    authManager?: AuthManager,
    allowSelfSignCert?: boolean,
  ) {
    this._serviceUrl = serviceUrl;
    this.authManager = authManager;
    this.allowSelfSignCert = allowSelfSignCert || false;
  }

  public get serviceUrl(): string {
    return this._serviceUrl;
  }

  /**
   * Creates a new account and user with the provided details
   * @param meta the registration details
   * @param meta.email the email address that uniquely identifies the user
   * @param meta.password the password for the user
   * @param meta.friendlyName the friendly name the user wishes to be addressed by
   * @param meta.accountName the friendly name to identify the account by
   */
  async register({
    userId,
    email,
    password,
    friendlyName,
    accountName,
  }: {
    userId: string;
    email: string;
    password: string;
    friendlyName: string;
    accountName: string;
  }): Promise<RegisterResult> {
    const url = urlJoin(this.serviceUrl, 'v1', 'register');
    const body = {
      userId,
      email,
      password,
      friendlyName,
      accountName,
    };

    const options = await getRequestOptions({
      allowSelfSignCert: this.allowSelfSignCert,
    });

    const resp = await axios.post(url, body, options);
    switch (resp.status) {
      case 200:
        return resp.data;
      default:
        throw new VError(
          {
            info: {
              status: resp.status,
              body: resp.data,
            },
          },
          'An error occurred while registering a new account.',
        );
    }
  }

  /**
   * Get authentication token for the given credentials
   * @param meta The authentication credentials
   * @param meta.accountId The account to authenticate to
   * @param meta.userId The user to authenticate with
   * @param meta.password The password to authenticate with
   */
  async authenticate({
    accountId,
    userId,
    password,
  }: {
    accountId: string;
    userId: string;
    password: string;
  }): Promise<string> {
    return this.authManager.getAuthenticationToken({
      accountId,
      userId,
      password,
    });
  }

  /**
   * Update details of the user
   * @param meta The authentication credentials
   * @param meta.email The new account recovery email address
   * @param meta.oldPassword The old password for this user for validation during update
   * @param meta.newPassword The new password for this user
   * @param meta.friendlyName The new friendly name for the user
   */
  async updateUser({
    email,
    oldPassword,
    newPassword,
    friendlyName,
  }: {
    email?: string;
    oldPassword?: string;
    newPassword?: string;
    friendlyName?: string;
  }): Promise<void> {
    const url = urlJoin(this.serviceUrl, 'v1', 'updateUser');
    const body = {
      email,
      oldPassword,
      newPassword,
      friendlyName,
    };

    const options = await getRequestOptions({
      allowSelfSignCert: this.allowSelfSignCert,
      authManager: this.authManager,
    });

    const resp = await axios.post(url, body, options);
    switch (resp.status) {
      case 200:
        return;
      default:
        throw new VError(
          {
            info: {
              status: resp.status,
              body: resp.data,
            },
          },
          'An error occurred while updating the user.',
        );
    }
  }

  /**
   * Gets the public signature all tokens are signed with by the identity endpoint
   */
  async getPublicSignature(): Promise<PublicSignatureResponse> {
    const url = urlJoin(this.serviceUrl, 'v1', 'publicSignature');

    const options = await getRequestOptions({
      allowSelfSignCert: this.allowSelfSignCert,
    });

    const resp = await axios.get(url, options);
    switch (resp.status) {
      case 200:
        return resp.data;
      default:
        throw new VError(
          {
            info: {
              status: resp.status,
              body: resp.data,
            },
          },
          'An error occurred while acquiring the public signature.',
        );
    }
  }

  /**
   * Get impersonation token for a user on a given account
   * @param meta The authentication credentials
   * @param meta.accountId The account to impersonate a user under
   * @param meta.userId If provided the specific user to impersonate, else the root user.
   */
  async impersonateUser({
    accountId,
    userId,
  }: {
    accountId: string;
    userId?: string;
  }): Promise<ImpersonationResult> {
    const url = urlJoin(this.serviceUrl, 'v1', 'impersonate');
    const body = {
      accountId,
      userId,
    };

    const options = await getRequestOptions({
      allowSelfSignCert: this.allowSelfSignCert,
      authManager: this.authManager,
    });

    const resp = await axios.post(url, body, options);
    switch (resp.status) {
      case 200:
        return resp.data;
      default:
        throw new VError(
          {
            info: {
              status: resp.status,
              body: resp.data,
            },
          },
          'An error occurred while obtaining impersonation token.',
        );
    }
  }
}
