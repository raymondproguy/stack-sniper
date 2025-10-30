export function cleanHtml(html:any) {
  if (!html) return '';
  
  // Decode HTML entities
  let text = html
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#x27;/g, "'")  // Add this for different apostrophe encoding
    .replace(/&#x2F;/g, '/')  // Add this for slash encoding
    .replace(/<br\s*\/?>/g, '\n')  // Convert <br> tags to newlines
    .replace(/<p>/g, '\n\n')  // Convert <p> tags to double newlines
    .replace(/<\/p>/g, '');
  
  // Remove all remaining HTML tags
  text = text.replace(/<[^>]*>/g, '');
  
  // Clean up whitespace and newlines
  text = text
    .replace(/\n\s*\n/g, '\n\n') // Multiple newlines to double newlines
    .replace(/^\s+|\s+$/g, '') // Trim
    .replace(/\s+/g, ' '); // Multiple spaces to single space
  
  return text.trim();
}

export function validateError(error:any) {
  if (!error) {
    return 'Error parameter is required';
  }
  
  if (typeof error !== 'string') {
    return 'Error must be a string';
  }
  
  if (error.trim().length === 0) {
    return 'Error cannot be empty';
  }
  
  if (error.length > 500) {
    return 'Error message too long (max 500 characters)';
  }
  
  return null; // No error
}
