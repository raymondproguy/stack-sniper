// Add these utility functions
export function extractErrorType(error: string): string {
    // Simple error type extraction
    if (error.includes('SyntaxError')) return 'SyntaxError';
    if (error.includes('TypeError')) return 'TypeError';
    if (error.includes('ReferenceError')) return 'ReferenceError';
    if (error.includes('RangeError')) return 'RangeError';
    return 'UnknownError';
}

export function estimateTokens(text: string): number {
    // Simple token estimation (approx 4 characters per token)
    return Math.ceil(text.length / 4);
}

export function cleanAIResponse(text: string): string {
    // Clean AI response if needed
    return text.trim();
}
