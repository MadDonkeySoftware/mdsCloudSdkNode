import axios from 'axios';
import { Socket } from 'socket.io-client';
import { VError } from 'verror';
import { AuthManager } from '../lib';
import { getRequestOptions, urlJoin } from '../lib/utils';
import { getSocketClient } from '../wrappers';

export type OnCallback = (...args: unknown[]) => void;
export type OffCallback = (...args: unknown[]) => void;

export class NotificationServiceClient {
  private _serviceUrl: string;
  private authManager: AuthManager;
  private socket: Socket;

  /**
   * Initializes a new instance of the File Service client.
   *
   * @param serviceUrl The url base that this client should use for service communication.
   */
  constructor(serviceUrl: string, authManager?: AuthManager) {
    this._serviceUrl = serviceUrl;
    this.authManager = authManager;
    this.socket = getSocketClient(serviceUrl, {
      auth: async (cb) => {
        const token = await authManager.getAuthenticationToken();
        cb({ token });
      },
    });
  }

  public get serviceUrl(): string {
    return this._serviceUrl;
  }

  /**
   * Emits a new message on the provided topic
   * @param topicOrid The ORID of the topic to emit the message to
   * @param message The message to emit
   */
  async emit(topicOrid: string, message: any): Promise<void> {
    const url = urlJoin(this.serviceUrl, 'v1', 'emit', topicOrid);
    const isObject = typeof message === 'object';

    const options = await getRequestOptions({
      authManager: this.authManager,
      headers: {
        'Content-Type': isObject ? 'application/json' : 'text/plain',
      },
    });

    const resp = await axios.post(url, message, options);
    switch (resp.status) {
      case 200:
        return Promise.resolve();
      default:
        throw new VError(
          {
            info: {
              status: resp.status,
              body: resp.data,
            },
          },
          'An error occurred while attempting to emit the message.',
        );
    }
  }

  /**
   * Wire an event handler for a given topic
   * @param topic The topic to subscribe to
   * @param handler The function that will handle events
   */
  on(topic: string, handler: OnCallback) {
    this.socket.on(topic, handler);
  }

  /**
   * Remove an event handler form a given topic
   * @param topic The topic to subscribe to
   * @param handler The function to unsubscribe. All if omitted.
   */
  off(topic?: string, handler?: OffCallback) {
    this.socket.off(topic, handler);
  }

  /**
   * Closes the underlying socket
   */
  close() {
    this.socket.disconnect();
  }
}
