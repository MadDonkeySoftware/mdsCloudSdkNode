import { verboseWrite } from '../verbose-write';

describe(__filename, () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('does not write when condition is false', async () => {
    // Arrange
    const writeSpy = jest.spyOn(process.stdout, 'write');

    // Act
    verboseWrite('test');

    // Assert
    expect(writeSpy).toHaveBeenCalledTimes(0);
  });

  it('does write when condition is true', async () => {
    // Arrange
    const writeSpy = jest.spyOn(process.stdout, 'write');

    // Act
    verboseWrite('test', true);

    // Assert
    expect(writeSpy).toHaveBeenCalledTimes(1);
  });
});
