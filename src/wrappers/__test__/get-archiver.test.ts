import { getArchiver } from '../get-archiver';

describe(__filename, () => {
  describe('getSocketClient', () => {
    it('provides archiver object when called', () => {
      // Arrange

      // Act
      const archiver = getArchiver('zip');

      // Assert
      expect(archiver).not.toBe(null);
      expect(archiver).not.toBe(undefined);
      archiver.destroy();
    });
  });
});
