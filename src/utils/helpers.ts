export function cleanHtml(html:any) {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .substring(0, 1500)
    .trim();
}

export function validateError(error:any) {
  if (!error || error.trim().length < 2) {
    return 'Error must be at least 2 characters';
  }
  return null;
}
