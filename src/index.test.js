const chai = require('chai');
const proxyquire = require('proxyquire');

const index = proxyquire('./index', {
  './notification-service': proxyquire('./notification-service', {
    'socket.io-client': () => {},
  }),
});

describe('index', () => {
  it('initialize provides clients configured urls', () => {
    // Arrange
    const qsUrl = 'http://127.0.0.1:80';
    const smUrl = 'http://127.0.0.1:81';
    const fsUrl = 'http://127.0.0.1:82';
    const nsUrl = 'http://127.0.0.1:83';

    // Act
    index.initialize({
      qsUrl,
      smUrl,
      fsUrl,
      nsUrl,
    });

    // Assert
    const qsClient = index.getQueueServiceClient();
    const smClient = index.getStateMachineServiceClient();
    const fsClient = index.getFileServiceClient();
    const nsClient = index.getNotificationServiceClient();

    chai.expect(qsClient.serviceUrl).to.be.equal(qsUrl, 'Queue service url incorrectly configured.');
    chai.expect(smClient.serviceUrl).to.be.equal(smUrl, 'State machine service url incorrectly configured.');
    chai.expect(fsClient.serviceUrl).to.be.equal(fsUrl, 'File service url incorrectly configured.');
    chai.expect(nsClient.serviceUrl).to.be.equal(nsUrl, 'Notification service url incorrectly configured.');
  });

  it('get client methods use parameter when global not initialize not invoked', () => {
    // Arrange
    const qsUrl = 'http://127.0.0.1:8080';
    const smUrl = 'http://127.0.0.1:8081';
    const fsUrl = 'http://127.0.0.1:8082';
    const nsUrl = 'http://127.0.0.1:8083';

    // Act
    const qsClient = index.getQueueServiceClient(qsUrl);
    const smClient = index.getStateMachineServiceClient(smUrl);
    const fsClient = index.getFileServiceClient(fsUrl);
    const nsClient = index.getNotificationServiceClient(nsUrl);

    // Assert
    chai.expect(qsClient.serviceUrl).to.be.equal(qsUrl, 'Queue service url incorrectly configured.');
    chai.expect(smClient.serviceUrl).to.be.equal(smUrl, 'State machine service url incorrectly configured.');
    chai.expect(fsClient.serviceUrl).to.be.equal(fsUrl, 'File service url incorrectly configured.');
    chai.expect(nsClient.serviceUrl).to.be.equal(nsUrl, 'Notification service url incorrectly configured.');
  });

  it('get client methods use parameter when default initialize invoked', () => {
    // Arrange
    const qsUrl = 'http://127.0.0.1:8080';
    const smUrl = 'http://127.0.0.1:8081';
    const fsUrl = 'http://127.0.0.1:8082';
    const nsUrl = 'http://127.0.0.1:8083';
    index.initialize();

    // Act
    const qsClient = index.getQueueServiceClient(qsUrl);
    const smClient = index.getStateMachineServiceClient(smUrl);
    const fsClient = index.getFileServiceClient(fsUrl);
    const nsClient = index.getNotificationServiceClient(nsUrl);

    // Assert
    chai.expect(qsClient.serviceUrl).to.be.equal(qsUrl, 'Queue service url incorrectly configured.');
    chai.expect(smClient.serviceUrl).to.be.equal(smUrl, 'State machine service url incorrectly configured.');
    chai.expect(fsClient.serviceUrl).to.be.equal(fsUrl, 'File service url incorrectly configured.');
    chai.expect(nsClient.serviceUrl).to.be.equal(nsUrl, 'Notification service url incorrectly configured.');
  });

  it('get client methods use parameter over global initialized values', () => {
    // Arrange
    const qsUrl = 'http://127.0.0.1:8080';
    const smUrl = 'http://127.0.0.1:8081';
    const fsUrl = 'http://127.0.0.1:8082';
    const nsUrl = 'http://127.0.0.1:8082';

    // Act
    index.initialize({
      qsUrl: 'http://127.0.0.1:80',
      smUrl: 'http://127.0.0.1:81',
      fsUrl: 'http://127.0.0.1:82',
      nsUrl: 'http://127.0.0.1:83',
    });

    // Assert
    const qsClient = index.getQueueServiceClient(qsUrl);
    const smClient = index.getStateMachineServiceClient(smUrl);
    const fsClient = index.getFileServiceClient(fsUrl);
    const nsClient = index.getNotificationServiceClient(nsUrl);

    chai.expect(qsClient.serviceUrl).to.be.equal(qsUrl, 'Queue service url incorrectly configured.');
    chai.expect(smClient.serviceUrl).to.be.equal(smUrl, 'State machine service url incorrectly configured.');
    chai.expect(fsClient.serviceUrl).to.be.equal(fsUrl, 'File service url incorrectly configured.');
    chai.expect(nsClient.serviceUrl).to.be.equal(nsUrl, 'Notification service url incorrectly configured.');
  });
});
