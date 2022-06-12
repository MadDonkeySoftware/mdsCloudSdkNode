import { io, ManagerOptions, SocketOptions } from 'socket.io-client';

/**
 * Wrapper around the socket.io-client library
 * @param serviceUrl The url base that this client should use for service communication.
 */
export function getSocketClient(
  serviceUrl: string,
  opts?: Partial<ManagerOptions & SocketOptions>,
) {
  return io(serviceUrl, opts);
}
