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
    const sfUrl = 'http://127.0.0.1:84';

    // Act
    index.initialize({
      qsUrl,
      smUrl,
      fsUrl,
      nsUrl,
      sfUrl,
    });

    // Assert
    const qsClient = index.getQueueServiceClient();
    const smClient = index.getStateMachineServiceClient();
    const fsClient = index.getFileServiceClient();
    const nsClient = index.getNotificationServiceClient();
    const sfClient = index.getServerlessFunctionsClient();

    chai.expect(qsClient.serviceUrl).to.be.equal(qsUrl, 'Queue service url incorrectly configured.');
    chai.expect(smClient.serviceUrl).to.be.equal(smUrl, 'State machine service url incorrectly configured.');
    chai.expect(fsClient.serviceUrl).to.be.equal(fsUrl, 'File service url incorrectly configured.');
    chai.expect(nsClient.serviceUrl).to.be.equal(nsUrl, 'Notification service url incorrectly configured.');
    chai.expect(sfClient.serviceUrl).to.be.equal(sfUrl, 'Serverless functions service url incorrectly configured.');
  });

  // it('get client methods use parameter when global not initialize not invoked', () => {
  //   // Arrange
  //   const qsUrl = 'http://127.0.0.1:8080';
  //   const smUrl = 'http://127.0.0.1:8081';
  //   const fsUrl = 'http://127.0.0.1:8082';
  //   const nsUrl = 'http://127.0.0.1:8083';
  //   const sfUrl = 'http://127.0.0.1:8084';

  //   // Act
  //   const qsClient = index.getQueueServiceClient(qsUrl);
  //   const smClient = index.getStateMachineServiceClient(smUrl);
  //   const fsClient = index.getFileServiceClient(fsUrl);
  //   const nsClient = index.getNotificationServiceClient(nsUrl);
  //   const sfClient = index.getServerlessFunctionsClient(sfUrl);

  //   // Assert
  //   chai.expect(qsClient.serviceUrl).to.be.equal(qsUrl, 'Queue service url incorrectly configured.');
  //   chai.expect(smClient.serviceUrl).to.be.equal(smUrl, 'State machine service url incorrectly configured.');
  //   chai.expect(fsClient.serviceUrl).to.be.equal(fsUrl, 'File service url incorrectly configured.');
  //   chai.expect(nsClient.serviceUrl).to.be.equal(nsUrl, 'Notification service url incorrectly configured.');
  //   chai.expect(sfClient.serviceUrl).to.be.equal(sfUrl, 'Serverless functions service url incorrectly configured.');
  // });

  // it('get client methods use parameter when default initialize invoked', () => {
  //   // Arrange
  //   const qsUrl = 'http://127.0.0.1:8080';
  //   const smUrl = 'http://127.0.0.1:8081';
  //   const fsUrl = 'http://127.0.0.1:8082';
  //   const nsUrl = 'http://127.0.0.1:8083';
  //   const sfUrl = 'http://127.0.0.1:8084';
  //   index.initialize();

  //   // Act
  //   const qsClient = index.getQueueServiceClient(qsUrl);
  //   const smClient = index.getStateMachineServiceClient(smUrl);
  //   const fsClient = index.getFileServiceClient(fsUrl);
  //   const nsClient = index.getNotificationServiceClient(nsUrl);
  //   const sfClient = index.getServerlessFunctionsClient(sfUrl);

  //   // Assert
  //   chai.expect(qsClient.serviceUrl).to.be.equal(qsUrl, 'Queue service url incorrectly configured.');
  //   chai.expect(smClient.serviceUrl).to.be.equal(smUrl, 'State machine service url incorrectly configured.');
  //   chai.expect(fsClient.serviceUrl).to.be.equal(fsUrl, 'File service url incorrectly configured.');
  //   chai.expect(nsClient.serviceUrl).to.be.equal(nsUrl, 'Notification service url incorrectly configured.');
  //   chai.expect(sfClient.serviceUrl).to.be.equal(sfUrl, 'Serverless functions service url incorrectly configured.');
  // });

  // it('get client methods use parameter over global initialized values', () => {
  //   // Arrange
  //   const qsUrl = 'http://127.0.0.1:8080';
  //   const smUrl = 'http://127.0.0.1:8081';
  //   const fsUrl = 'http://127.0.0.1:8082';
  //   const nsUrl = 'http://127.0.0.1:8082';
  //   const sfUrl = 'http://127.0.0.1:8084';

  //   // Act
  //   index.initialize({
  //     qsUrl: 'http://127.0.0.1:80',
  //     smUrl: 'http://127.0.0.1:81',
  //     fsUrl: 'http://127.0.0.1:82',
  //     nsUrl: 'http://127.0.0.1:83',
  //     sfUrl: 'http://127.0.0.1:84',
  //   });

  //   // Assert
  //   const qsClient = index.getQueueServiceClient(qsUrl);
  //   const smClient = index.getStateMachineServiceClient(smUrl);
  //   const fsClient = index.getFileServiceClient(fsUrl);
  //   const nsClient = index.getNotificationServiceClient(nsUrl);
  //   const sfClient = index.getServerlessFunctionsClient(sfUrl);

  //   chai.expect(qsClient.serviceUrl).to.be.equal(qsUrl, 'Queue service url incorrectly configured.');
  //   chai.expect(smClient.serviceUrl).to.be.equal(smUrl, 'State machine service url incorrectly configured.');
  //   chai.expect(fsClient.serviceUrl).to.be.equal(fsUrl, 'File service url incorrectly configured.');
  //   chai.expect(nsClient.serviceUrl).to.be.equal(nsUrl, 'Notification service url incorrectly configured.');
  //   chai.expect(sfClient.serviceUrl).to.be.equal(sfUrl, 'Serverless functions service url incorrectly configured.');
  // });

  it('throws error when initialized with invalid parameter type', () => {
    try {
      // Act
      index.initialize(1);
      throw new Error('Test passed when it should not have.');
    } catch (err) {
      chai.expect(err.message).to.be.equal('Initialization of MDS SDK failed. Type \'number\' not supported.');
    }
  });
});
