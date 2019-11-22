const chai = require('chai');

const index = require('./index');

describe('index', () => {

  describe('index', () => {
    it('initialize provides clients configured urls', () => {
      // Arrange
      const qsUrl = 'http://127.0.0.1:80';
      const smUrl = 'http://127.0.0.1:81';
      const fsUrl = 'http://127.0.0.1:82';

      // Act
      index.initialize({
        qsUrl,
        smUrl,
        fsUrl,
      });

      // Assert
      const qsClient = index.getQueueServiceClient();
      const smClient = index.getStateMachineServiceClient();
      const fsClient = index.getFileServiceClient();

      chai.expect(qsClient.serviceUrl).to.be.equal(qsUrl, 'Queue service url incorrectly configured.');
      chai.expect(smClient.serviceUrl).to.be.equal(smUrl, 'State machine service url incorrectly configured.');
      chai.expect(fsClient.serviceUrl).to.be.equal(fsUrl, 'File service url incorrectly configured.');
    });

    it('get client methods use parameter when global not initialize not invoked', () => {
      // Arrange
      const qsUrl = 'http://127.0.0.1:8080';
      const smUrl = 'http://127.0.0.1:8081';
      const fsUrl = 'http://127.0.0.1:8082';

      // Act
      const qsClient = index.getQueueServiceClient(qsUrl);
      const smClient = index.getStateMachineServiceClient(smUrl);
      const fsClient = index.getFileServiceClient(fsUrl);

      // Assert
      chai.expect(qsClient.serviceUrl).to.be.equal(qsUrl, 'Queue service url incorrectly configured.');
      chai.expect(smClient.serviceUrl).to.be.equal(smUrl, 'State machine service url incorrectly configured.');
      chai.expect(fsClient.serviceUrl).to.be.equal(fsUrl, 'File service url incorrectly configured.');
    });

    it('get client methods use parameter when default initialize invoked', () => {
      // Arrange
      const qsUrl = 'http://127.0.0.1:8080';
      const smUrl = 'http://127.0.0.1:8081';
      const fsUrl = 'http://127.0.0.1:8082';
      index.initialize();

      // Act
      const qsClient = index.getQueueServiceClient(qsUrl);
      const smClient = index.getStateMachineServiceClient(smUrl);
      const fsClient = index.getFileServiceClient(fsUrl);

      // Assert
      chai.expect(qsClient.serviceUrl).to.be.equal(qsUrl, 'Queue service url incorrectly configured.');
      chai.expect(smClient.serviceUrl).to.be.equal(smUrl, 'State machine service url incorrectly configured.');
      chai.expect(fsClient.serviceUrl).to.be.equal(fsUrl, 'File service url incorrectly configured.');
    });

    it('get client methods use parameter over global initialized values', () => {
      // Arrange
      const qsUrl = 'http://127.0.0.1:8080';
      const smUrl = 'http://127.0.0.1:8081';
      const fsUrl = 'http://127.0.0.1:8082';

      // Act
      index.initialize({
        qsUrl: 'http://127.0.0.1:80',
        smUrl: 'http://127.0.0.1:81',
        fsUrl: 'http://127.0.0.1:82',
      });

      // Assert
      const qsClient = index.getQueueServiceClient(qsUrl);
      const smClient = index.getStateMachineServiceClient(smUrl);
      const fsClient = index.getFileServiceClient(fsUrl);

      chai.expect(qsClient.serviceUrl).to.be.equal(qsUrl, 'Queue service url incorrectly configured.');
      chai.expect(smClient.serviceUrl).to.be.equal(smUrl, 'State machine service url incorrectly configured.');
      chai.expect(fsClient.serviceUrl).to.be.equal(fsUrl, 'File service url incorrectly configured.');
    });

  });
});
