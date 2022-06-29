import { urlJoin } from '..';

describe(__filename, () => {
  it('no arguments returns empty string', () => {
    const result = urlJoin();

    expect(result).toBe('');
  });

  it('handles basic url joining with no slashes', () => {
    const result = urlJoin('http://localhost', 'thing');

    expect(result).toBe('http://localhost/thing');
  });

  it('handles basic url joining with trailing slash', () => {
    const result = urlJoin('http://localhost/', 'thing');

    expect(result).toBe('http://localhost/thing');
  });

  it('handles basic url joining with leading slash', () => {
    const result = urlJoin('http://localhost', '/thing');

    expect(result).toBe('http://localhost/thing');
  });

  it('handles basic url joining with trailing and leading slashes', () => {
    const result = urlJoin('http://localhost/', '/thing');

    expect(result).toBe('http://localhost/thing');
  });

  it('handles basic url joining with nested slashes', () => {
    const result = urlJoin('http://localhost', 'thing/two');

    expect(result).toBe('http://localhost/thing/two');
  });

  it('handles basic url joining with url parameters', () => {
    const result = urlJoin('http://localhost', 'thing', '?foo=1');

    expect(result).toBe('http://localhost/thing?foo=1');
  });

  it('handles basic url joining with multiple url parameters', () => {
    const result = urlJoin('http://localhost', 'thing', '?foo=1', '?bar=2');

    expect(result).toBe('http://localhost/thing?foo=1&bar=2');
  });

  it('handles basic url joining with pre-joined url parameters', () => {
    const result = urlJoin('http://localhost', 'thing', '?foo=1&bar=2');

    expect(result).toBe('http://localhost/thing?foo=1&bar=2');
  });
});
