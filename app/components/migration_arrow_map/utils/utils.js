
export function cleanCssName(string) {
  return string.replace(/^[^a-z]+|[^\w:.-]+/gi, "")
}
