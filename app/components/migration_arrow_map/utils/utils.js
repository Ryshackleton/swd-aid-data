/* eslint-disable-next-line import/prefer-default-export */
export function cleanCssName(string) {
  return string.replace(/^[^a-z]+|[^\w:.-]+/gi, '');
}
