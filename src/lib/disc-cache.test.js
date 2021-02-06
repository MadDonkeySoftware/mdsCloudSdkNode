const fs = require('fs');
const chai = require('chai');
const sinon = require('sinon');

const DiscCache = require('./disc-cache');

describe('disc-cache', () => {
  // NOTE: Keep these stubs as we're safe guarding against disrupting the developers cache
  /** @type {sinon.SinonStub} */
  let existsSyncStub;
  /** @type {sinon.SinonStub} */
  // eslint-disable-next-line no-unused-vars
  let mkdirSyncStub;
  /** @type {sinon.SinonStub} */
  // eslint-disable-next-line no-unused-vars
  let writeFileSyncStub;
  /** @type {sinon.SinonStub} */
  let readFileSyncStub;

  beforeEach(() => {
    existsSyncStub = sinon.stub(fs, 'existsSync');
    // eslint-disable-next-line no-unused-vars
    mkdirSyncStub = sinon.stub(fs, 'mkdirSync');
    // eslint-disable-next-line no-unused-vars
    writeFileSyncStub = sinon.stub(fs, 'writeFileSync');
    readFileSyncStub = sinon.stub(fs, 'readFileSync');
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('get/set operations', () => {
    it('One set followed by one get return correct result', () => {
      // Arrange
      const expected = { foo: 'bar' };
      const cache = new DiscCache();

      // Act
      cache.set('testKey', expected);
      const underTest = cache.get('testKey');

      // Assert
      chai.expect(underTest).to.deep.equal(expected);
    });

    it('Set creates cache file when it does not exist.', () => {
      // Arrange
      const expected = { foo: 'bar' };
      const cache = new DiscCache();
      existsSyncStub.returns(true);

      // Act
      cache.set('testKey', expected);
      const underTest = cache.get('testKey');

      // Assert
      chai.expect(underTest).to.deep.equal(expected);
    });

    it('Get on non-existent key returns undefined', () => {
      // Arrange
      const cache = new DiscCache();

      // Act
      const underTest = cache.get('testKey');

      // Assert
      chai.expect(underTest).to.deep.equal(undefined);
    });

    it('Get on existent-on-disc key returns value', () => {
      // Arrange
      const cache = new DiscCache();
      existsSyncStub.returns(true);
      readFileSyncStub.returns(JSON.stringify({ testKey: 'foo' }));

      // Act
      const underTest = cache.get('testKey');

      // Assert
      chai.expect(underTest).to.be.equal('foo');
    });

    it('Get on empty-on-disc-cache key returns undefined', () => {
      // Arrange
      const cache = new DiscCache();
      existsSyncStub.returns(true);
      readFileSyncStub.returns('');

      // Act
      const underTest = cache.get('testKey');

      // Assert
      chai.expect(underTest).to.be.equal(undefined);
    });

    it('Two sets on single key followed by one get return correct result', () => {
      // Arrange
      const expected = { foo: 'bar' };
      const cache = new DiscCache();

      // Act
      cache.set('testKey', { foo: 'baz' });
      cache.set('testKey', expected);
      const underTest = cache.get('testKey');

      // Assert
      chai.expect(underTest).to.deep.equal(expected);
    });

    it('Two sets on different keys followed by gets return correct results', () => {
      // Arrange
      const expected1 = { foo: 'bar' };
      const expected2 = { foo: 'baz' };
      const cache = new DiscCache();

      // Act
      cache.set('testKey1', expected1);
      cache.set('testKey2', expected2);
      const underTest1 = cache.get('testKey1');
      const underTest2 = cache.get('testKey2');

      // Assert
      chai.expect(underTest1).to.deep.equal(expected1);
      chai.expect(underTest2).to.deep.equal(expected2);
    });
  });

  describe('remove/removeAll operations', () => {
    it('Remove causes keys value to be undefined', () => {
      // Arrange
      const cache = new DiscCache();

      // Act
      cache.set('testKey', { foo: 'bar' });
      cache.remove('testKey');
      const underTest = cache.get('testKey');

      // Assert
      chai.expect(underTest).to.deep.equal(undefined);
    });

    it('Remove on one key does not affect other keys', () => {
      // Arrange
      const expected = { foo: 'bar' };
      const cache = new DiscCache();

      // Act
      cache.set('testKey', expected);
      cache.set('testKey2', { foo: 'baz' });
      cache.remove('testKey2');
      const underTest1 = cache.get('testKey');
      const underTest2 = cache.get('testKey2');

      // Assert
      chai.expect(underTest1).to.deep.equal(expected);
      chai.expect(underTest2).to.deep.equal(undefined);
    });

    it('RemoveAll removes all set keys', () => {
      // Arrange
      const cache = new DiscCache();

      // Act
      cache.set('testKey1', { foo: 'bar' });
      cache.set('testKey2', { foo: 'baz' });
      cache.removeAll();
      const underTest1 = cache.get('testKey1');
      const underTest2 = cache.get('testKey2');

      // Assert
      chai.expect(underTest1).to.deep.equal(undefined);
      chai.expect(underTest2).to.deep.equal(undefined);
    });
  });
});
