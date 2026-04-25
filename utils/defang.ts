export function defangIndicator(indicator: string): string {
  return indicator
    .replace(/\./g, '[.]')
    .replace(/^https?:\/\//i, (m) => m.replace('://', '[://]'))
    .replace(/^http/i, 'hxxp')
}

export function defangAll(text: string): string {
  return text
    .replace(/(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})/g, '$1[.]$2[.]$3[.]$4')
    .replace(/https?:\/\//gi, 'hxxps://')
    .replace(/([a-z0-9-]+)\.(com|net|org|io|xyz|ru|cn|tk)/gi, '$1[.]$2')
}

export function refang(indicator: string): string {
  return indicator
    .replace(/\[\.\]/g, '.')
    .replace(/\[:\/\/\]/g, '://')
    .replace(/^hxxp/i, 'http')
}
