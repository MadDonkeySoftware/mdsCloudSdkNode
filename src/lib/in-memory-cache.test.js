const chai = require('chai');
const sinon = require('sinon');

const InMemoryCache = require('./in-memory-cache');

describe('in-memory-cache', () => {
  beforeEach(() => {
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('get/set operations', () => {
    it('One set followed by one get return correct result', () => {
      // Arrange
      const expected = { foo: 'bar' };
      const cache = new InMemoryCache();

      // Act
      cache.set('testKey', expected);
      const underTest = cache.get('testKey');

      // Assert
      chai.expect(underTest).to.deep.equal(expected);
    });

    it('Get on non-existent key returns undefined', () => {
      // Arrange
      const cache = new InMemoryCache();

      // Act
      const underTest = cache.get('testKey');

      // Assert
      chai.expect(underTest).to.deep.equal(undefined);
    });

    it('Two sets on single key followed by one get return correct result', () => {
      // Arrange
      const expected = { foo: 'bar' };
      const cache = new InMemoryCache();

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
      const cache = new InMemoryCache();

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
      const cache = new InMemoryCache();

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
      const cache = new InMemoryCache();

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
      const cache = new InMemoryCache();

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
