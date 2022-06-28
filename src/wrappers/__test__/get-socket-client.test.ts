import { getSocketClient } from '../get-socket-client';

describe(__filename, () => {
  describe('getSocketClient', () => {
    it('provides socket object when called', () => {
      // Arrange

      // Act
      const client = getSocketClient('http://127.0.0.1:8888');

      // Assert
      expect(client).not.toBe(null);
      expect(client).not.toBe(undefined);
      client.close();
    });
  });
});
