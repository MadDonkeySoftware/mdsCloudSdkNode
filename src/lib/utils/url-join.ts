// NOTE: the entire reason this exists is because the url-join on NPM is not cooperating with jest and
// I have not been able to figure out the proper configuration to get it working.
export function urlJoin(...args: string[]): string {
  return args
    .join('/')
    .replace(/[/]+/g, '/')
    .replace(/^(.+):\//, '$1://')
    .replace(/^file:/, 'file:/')
    .replace(/\/(\?|&|#[^!])/g, '$1')
    .replace(/\?/g, '&')
    .replace('&', '?');
}
