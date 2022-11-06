import axios from 'axios';
import { VError } from 'verror';
import { merge } from 'lodash';
import { AuthManager } from '../lib';
import { getRequestOptions, urlJoin } from '../lib/utils';
import {
  CreateQueueResult,
  MessageResponse,
  QueueDetails,
  QueueLength,
  QueueListItem,
  QueueOptions,
} from '../types/queue-service';

export class QueueServiceClient {
  private _serviceUrl: string;
  private authManager: AuthManager;

  constructor(serviceUrl: string, authManager?: AuthManager) {
    this._serviceUrl = serviceUrl;
    this.authManager = authManager;
  }

  public get serviceUrl(): string {
    return this._serviceUrl;
  }

  /**
   * Creates a new queue with the provided options
   * @param name the name of the queue
   * @param options the options with which to create the queue
   */
  async createQueue(
    name: string,
    { resource, dlq }: QueueOptions = {},
  ): Promise<CreateQueueResult> {
    const url = urlJoin(this.serviceUrl, 'v1', 'queue');
    const body: {
      name: string;
      resource?: string;
      dlq?: string;
    } = {
      name,
    };

    if (resource) {
      body.resource = resource;
    }

    if (dlq) {
      body.dlq = dlq;
    }

    const options = await getRequestOptions({
      authManager: this.authManager,
    });
    const resp = await axios.post(url, body, options);

    switch (resp.status) {
      case 201:
        return { status: 'created', ...resp.data };
      case 200:
        return { status: 'exists', ...resp.data };
      default:
        throw new VError(
          {
            info: {
              status: resp.status,
              body: resp.data,
            },
          },
          'An error occurred while creating the queue.',
        );
    }
  }

  /**
   * Removes a message from the queue service queue.
   * @param orid the orid of the queue
   * @param id the unique identifier of the message to remove.
   */
  async deleteMessage(orid: string, id: string): Promise<void> {
    const url = urlJoin(this.serviceUrl, 'v1', 'message', orid, id);
    const options = await getRequestOptions({
      authManager: this.authManager,
    });

    const resp = await axios.delete(url, options);
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
          'An error occurred while deleting the message.',
        );
    }
  }

  /**
   * Removes the specified queue from the queue service.
   * @param orid the orid of the queue
   */
  async deleteQueue(orid: string): Promise<void> {
    const url = urlJoin(this.serviceUrl, 'v1', 'queue', orid);
    const options = await getRequestOptions({
      authManager: this.authManager,
    });

    const resp = await axios.delete(url, options);
    switch (resp.status) {
      case 204:
        return;
      default:
        throw new VError(
          {
            info: {
              status: resp.status,
              body: resp.data,
            },
          },
          'An error occurred while deleting the queue.',
        );
    }
  }

  /**
   * Removes a message from the queue service queue.
   * @param orid the orid of the queue
   * @param message the message body.
   */
  async enqueueMessage(orid: string, message: unknown): Promise<void> {
    const url = urlJoin(this.serviceUrl, 'v1', 'message', orid);

    const options = await getRequestOptions({
      authManager: this.authManager,
    });
    const resp = await axios.post(url, message, options);
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
          'An error occurred while enqueueing the message.',
        );
    }
  }

  /**
   * Fetches a message from the queue service if one is available
   * @param orid the orid of the queue
   */
  async fetchMessage(orid: string): Promise<void | MessageResponse> {
    const url = urlJoin(this.serviceUrl, 'v1', 'message', orid);
    const options = await getRequestOptions({
      authManager: this.authManager,
    });

    const resp = await axios.get(url, options);
    switch (resp.status) {
      case 200: {
        const parsedBody = resp.data;
        return parsedBody.id ? parsedBody : Promise.resolve();
      }
      default:
        throw new VError(
          {
            info: {
              status: resp.status,
              body: resp.data,
            },
          },
          'An error occurred while fetching a message.',
        );
    }
  }

  /**
   * Get details about a specific queue
   * @param orid the orid of the queue
   */
  async getQueueDetails(orid: string): Promise<QueueDetails> {
    const url = urlJoin(this.serviceUrl, 'v1', 'queue', orid, 'details');
    const options = await getRequestOptions({
      authManager: this.authManager,
    });

    const resp = await axios.get(url, options);
    switch (resp.status) {
      case 200:
        return merge(
          {
            resource: undefined,
            dlq: undefined,
          },
          resp.data,
        );
      default:
        throw new VError(
          {
            info: {
              status: resp.status,
              body: resp.data,
            },
          },
          'An error occurred while obtaining the details of the queue.',
        );
    }
  }

  /**
   * Get the number of messages in the queue
   * @param orid the orid of the queue
   */
  async getQueueLength(orid: string): Promise<QueueLength> {
    const url = urlJoin(this.serviceUrl, 'v1', 'queue', orid, 'length');
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
          'An error occurred while obtaining the size of the queue.',
        );
    }
  }

  /**
   * Get a list of queue names available on the queue service
   */
  async listQueues(): Promise<QueueListItem[]> {
    const url = urlJoin(this.serviceUrl, 'v1', 'queues');
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
          'An error occurred while listing the available queues.',
        );
    }
  }

  /**
   * Updates the specified queue with the provided options
   * @param {String} orid the orid of the queue
   * @param {UpdateOptions} options
   * @returns {Promise<void|VError>}
   */
  async updateQueue(
    orid: string,
    { resource, dlq }: QueueOptions = {},
  ): Promise<void> {
    const url = urlJoin(this.serviceUrl, 'v1', 'queue', orid);
    const body: {
      resource?: string;
      dlq?: string;
    } = {};
    let skipPost = true;

    if (resource) {
      body.resource = resource.toUpperCase() === 'NULL' ? null : resource;
      skipPost = false;
    }

    if (dlq) {
      body.dlq = dlq.toUpperCase() === 'NULL' ? null : dlq;
      skipPost = false;
    }

    if (skipPost) {
      return Promise.reject(
        new VError(
          { name: 'NoActionAvailable' },
          'No update actions specified. Please update at least one option.',
        ),
      );
    }

    const options = await getRequestOptions({
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
          'An error occurred while updating the queue.',
        );
    }
  }
}
