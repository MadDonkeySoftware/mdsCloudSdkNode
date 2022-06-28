import axios from 'axios';
import urlJoin from 'url-join';
import FormData from 'form-data';
import { createReadStream, existsSync, unlinkSync } from 'fs';
import { VError } from 'verror';
import { AuthManager } from '../lib';
import { getRequestOptions, createArchiveFromDirectory } from '../lib/utils';

export interface CreateFunctionResult {
  /**
   * The identifier of the newly created function
   */
  id: string;

  /**
   * The status of the entity
   */
  status: string;
}

export interface FunctionListItem {
  /**
   * The id of the serverless function
   */
  id: string;

  /**
   * The friendly name of the serverless function
   */
  name: string;
}

export interface DeleteFunctionResult {
  /**
   * The identifier of the function
   */
  id: string;
  /**
   * The status of the entity
   */
  status: string;
}

export interface FunctionDetails {
  /**
   * The id of the function
   */
  id: string;

  /**
   * The friendly name of the function
   */
  name: string;
  /**
   * The current version of the function
   */
  version: string;
  /**
   * THe current runtime specified for the function
   */
  runtime: string;
  /**
   * The specified entry point for the current version of the function
   */
  entryPoint: string;
  /**
   * ISO formatted timestamp for when this function was created
   */
  created: string;
  /**
   * ISO formatted timestamp for when this function was last updated
   */
  lastUpdate: string;
  /**
   * ISO formatted timestamp for when this function was last invoked
   */
  lastInvoke: string;
}

export interface UpdateFunctionResult {
  /**
   * The id of the function
   */
  id: string;

  /**
   * The build status for the function
   */
  status: string;

  /**
   * The url used to invoke this function
   */
  invokeUrl?: string;
}

const getArchivePath = (sourcePathOrFile: string) =>
  sourcePathOrFile.endsWith('.zip')
    ? Promise.resolve({ filePath: sourcePathOrFile, userSupplied: true })
    : createArchiveFromDirectory(sourcePathOrFile);

export class ServerlessFunctionsClient {
  private _serviceUrl: string;
  private authManager: AuthManager;

  /**
   * Initializes a new instance of the Serverless Functions client
   *
   * @param serviceUrl The url base that this client should use for service communication.
   * @param authManager The authentication manager to use for certain requests.
   */
  constructor(serviceUrl: string, authManager?: AuthManager) {
    this._serviceUrl = serviceUrl;
    this.authManager = authManager;
  }

  public get serviceUrl(): string {
    return this._serviceUrl;
  }

  /**
   * Create a new function
   * @param name The function name
   */
  async createFunction(name: string): Promise<CreateFunctionResult> {
    const url = urlJoin(this.serviceUrl, 'v1', 'create');

    const options = await getRequestOptions({
      authManager: this.authManager,
    });

    const resp = await axios.post(url, { name }, options);
    switch (resp.status) {
      case 201: {
        const parsedBody = resp.data;
        return { status: 'created', id: parsedBody.orid || parsedBody.id };
      }
      default:
        throw new VError(
          {
            info: {
              status: resp.status,
              body: resp.data,
            },
          },
          'An error occurred while creating the serverless function.',
        );
    }
  }

  /**
   * Lists all serverless functions
   */
  async listFunctions(): Promise<FunctionListItem[]> {
    const url = urlJoin(this.serviceUrl, 'v1', 'list');

    const options = await getRequestOptions({
      authManager: this.authManager,
    });

    const resp = await axios.get(url, options);
    switch (resp.status) {
      case 200: {
        return resp.data;
      }
      default:
        throw new VError(
          {
            info: {
              status: resp.status,
              body: resp.data,
            },
          },
          'An error occurred while listing available serverless functions.',
        );
    }
  }

  /**
   * Deletes a serverless function
   * @param id The id of the state machine
   */
  async deleteFunction(id: string): Promise<DeleteFunctionResult> {
    const url = urlJoin(this.serviceUrl, 'v1', id);

    const options = await getRequestOptions({
      authManager: this.authManager,
    });

    const resp = await axios.delete(url, options);
    switch (resp.status) {
      case 204: {
        return { status: 'deleted', id };
      }
      default:
        throw new VError(
          {
            info: {
              status: resp.status,
              body: resp.data,
            },
          },
          'An error occurred while deleting the function.',
        );
    }
  }

  /**
   * Invoke a function
   * @param  id The identifier of the function to invoke
   * @param  payload The input supplied to the function. Suggested practice is to use an object.
   * @param  isAsync True to invoke the function and not wait for the result.
   */
  async invokeFunction(
    id: string,
    payload: unknown,
    isAsync?: boolean,
  ): Promise<unknown> {
    const url = `${urlJoin(this.serviceUrl, 'v1', 'invoke', id)}${
      isAsync ? '?async=true' : ''
    }`;

    const options = await getRequestOptions({
      authManager: this.authManager,
    });

    const resp = await axios.post(url, payload, options);
    switch (resp.status) {
      case 200: {
        return resp.data;
      }
      case 202: {
        return undefined;
      }
      default:
        throw new VError(
          {
            info: {
              status: resp.status,
              body: resp.data,
            },
          },
          'An error occurred while invoking the function.',
        );
    }
  }

  /**
   * Gets the details of a function
   * @param id The identifier of the function to invoke
   */
  async getFunctionDetails(id: string): Promise<FunctionDetails> {
    const url = urlJoin(this.serviceUrl, 'v1', 'inspect', id);

    const options = await getRequestOptions({
      authManager: this.authManager,
    });

    const resp = await axios.get(url, options);
    switch (resp.status) {
      case 200: {
        return resp.data;
      }
      default:
        throw new VError(
          {
            info: {
              status: resp.status,
              body: resp.data,
            },
          },
          'An error occurred while fetching function details.',
        );
    }
  }

  /**
   * Updates the code of a function on the serverless function provider
   * @param {String} id The identifier of the function to update
   * @param {String} runtime The runtime to utilize for the function
   * @param {String} entryPoint The entry point to use for the function
   * @param {String} sourcePathOrFile A path to the source directory or a zip file to upload
   * @param {String} [context] A string containing whatever context data this function should run with
   * @returns {Promise<UpdateFunctionResponse|VError>}
   */
  async updateFunctionCode(
    id: string,
    runtime: string,
    entryPoint: string,
    sourcePathOrFile: string,
    context?: string,
  ): Promise<UpdateFunctionResult> {
    const pathMeta = await getArchivePath(sourcePathOrFile);

    const form = new FormData();
    form.append('sourceArchive', createReadStream(pathMeta.filePath));
    form.append('runtime', runtime);
    form.append('entryPoint', entryPoint);
    if (context) {
      form.append('context', context);
    }

    const url = urlJoin(this.serviceUrl, 'v1', 'uploadCode', id);
    const options = await getRequestOptions({
      authManager: this.authManager,
      headers: {
        ...form.getHeaders(),
      },
    });

    const resp = await axios.post(url, form, options);
    if (!pathMeta.userSupplied && existsSync(pathMeta.filePath)) {
      unlinkSync(pathMeta.filePath);
    }
    switch (resp.status) {
      case 201: {
        return resp.data;
      }
      default:
        throw new VError(
          {
            info: {
              status: resp.status,
              body: resp.data,
            },
          },
          'An error occurred while updating the function.',
        );
    }
  }
}
