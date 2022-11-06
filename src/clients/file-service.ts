import axios from 'axios';
import FormData from 'form-data';
import { VError } from 'verror';
import { createReadStream } from 'fs';
import { AuthManager } from '../lib/auth-manager';
import { download, getRequestOptions, urlJoin } from '../lib/utils';
import {
  ContainerListItem,
  ContainerPathContents,
  CreateContainerPathResult,
  CreateContainerResult,
  UploadFileResult,
} from '../types';

export class FileServiceClient {
  private _serviceUrl: string;
  private authManager: AuthManager;

  /**
   *
   * @param serviceUrl The url base that this client should use for service communication.
   * @param authManager
   */
  constructor(serviceUrl: string, authManager: AuthManager) {
    this._serviceUrl = serviceUrl;
    this.authManager = authManager;
  }

  public get serviceUrl(): string {
    return this._serviceUrl;
  }

  /**
   * List the available containers from the container service
   * @returns The list of available containers
   */
  async listContainers(): Promise<ContainerListItem[]> {
    const url = urlJoin(this.serviceUrl, 'v1', 'containers');
    const options = await getRequestOptions({
      authManager: this.authManager,
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
          'An error occurred while obtaining the list of available containers.',
        );
    }
  }

  /**
   * Creates a new container with the specified name
   * @param name The name of the container to create
   * @returns
   */
  async createContainer(name: string): Promise<CreateContainerResult> {
    const url = urlJoin(this.serviceUrl, 'v1', 'createContainer', name);
    const options = await getRequestOptions({
      authManager: this.authManager,
    });

    const resp = await axios.post(url, {}, options);
    switch (resp.status) {
      case 201:
        return resp.data;
      case 409:
        throw new VError(
          {
            name: 'AlreadyExistsError',
            info: {
              name,
            },
          },
          'Container with the name "%s" already exists.',
          name,
        );
      default:
        throw new VError(
          {
            info: {
              status: resp.status,
              body: resp.data,
            },
          },
          'An error occurred while creating the container.',
        );
    }
  }

  /**
   * Creates a new container with the specified name
   * @param orid The orid of the container to create the path in
   * @param newPath the new path to create in the container, using / for separators.
   * @returns
   */
  async createContainerPath(
    orid: string,
    newPath: string,
  ): Promise<CreateContainerPathResult> {
    const url = urlJoin(this.serviceUrl, 'v1', 'create', orid, newPath);
    const options = await getRequestOptions({
      authManager: this.authManager,
    });

    const resp = await axios.post(url, {}, options);
    switch (resp.status) {
      case 201:
        return resp.data;
      case 409:
        throw new VError(
          {
            name: 'AlreadyExistsError',
            info: {
              orid,
              newPath,
            },
          },
          'Container path "%s" already exists in container "%s".',
          newPath,
          orid,
        );
      default:
        throw new VError(
          {
            info: {
              status: resp.status,
              body: resp.data,
            },
          },
          'An error occurred while creating the path in the container.',
        );
    }
  }

  /**
   * Deletes a container or path within a container.
   *
   * Ex. container/foo/bar where bar can be a file or folder. If bar is a folder the delete
   * is recursive.
   * @param containerOrPath The container name or path to an item in the container.
   * @returns
   */
  async deleteContainerOrPath(containerOrPath: string): Promise<void> {
    const url = urlJoin(this.serviceUrl, 'v1', containerOrPath);
    const options = await getRequestOptions({
      authManager: this.authManager,
    });

    const resp = await axios.delete(url, options);
    switch (resp.status) {
      case 204:
        return Promise.resolve();
      case 409:
        throw new VError(
          {
            name: 'DoesNotExistError',
            info: {
              containerOrPath,
            },
          },
          'An error occurred while removing the container or path.',
        );
      default:
        throw new VError(
          {
            info: {
              status: resp.status,
              body: resp.data,
            },
          },
          'An error occurred while removing the container or path.',
        );
    }
  }

  /**
   * Saves a file to the provided destination
   *
   * @param containerPath Path to the file to download
   * @param destination Path to where your file will be written
   * @returns
   */
  async downloadFile(
    containerPath: string,
    destination?: string,
  ): Promise<unknown> {
    const url = urlJoin(this.serviceUrl, 'v1', 'download', containerPath);

    return download(url, destination, this.authManager);
  }

  /**
   * Gets a object containing lists for the directories and files contained in the supplied path
   *
   * @param containerOrPath
   * @returns
   */
  async listContainerContents(
    containerOrPath: string,
  ): Promise<ContainerPathContents> {
    const url = urlJoin(this.serviceUrl, 'v1', 'list', containerOrPath);
    const options = await getRequestOptions({
      authManager: this.authManager,
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
          'An error occurred while obtaining the content list of a container.',
        );
    }
  }

  /**
   * @param containerPath The container name and optional path where to upload the file.
   * @param filePath The path to the file on the local system to upload
   * @returns
   */
  async uploadFile(
    containerPath: string,
    filePath: string,
  ): Promise<UploadFileResult> {
    const form = new FormData();
    form.append('file', createReadStream(filePath));

    const url = urlJoin(this.serviceUrl, 'v1', 'upload', containerPath);
    const options = await getRequestOptions({
      authManager: this.authManager,
      headers: form.getHeaders(),
    });

    const resp = await axios.post(url, form, options);
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
          'An error occurred while uploading the file to the container.',
        );
    }
  }
}
