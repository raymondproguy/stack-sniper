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

/*
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
*/

export function validateError(error: string): string | null {
  if (!error || typeof error !== 'string') {
    return 'Error parameter is required and must be a string';
  }
  
  if (error.trim().length < 5) {
    return 'Error message must be at least 5 characters long';
  }
  
  if (error.length > 500) {
    return 'Error message too long (max 500 characters)';
  }
  
  // Check if it looks like a real error
  const looksLikeError = 
    /error/i.test(error) ||
    /exception/i.test(error) ||
    /is not defined/i.test(error) ||
    /cannot read/i.test(error) ||
    /undefined/i.test(error) ||
    /null/i.test(error) ||
    /syntaxerror/i.test(error) ||
    /typeerror/i.test(error) ||
    /referenceerror/i.test(error);
  
  if (!looksLikeError) {
    return 'Please provide a valid error message or exception';
  }
  
  return null;
}
