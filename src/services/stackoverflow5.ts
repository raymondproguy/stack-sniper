import axios from 'axios';
import { logInfo, logError } from '../utils/logger.js';
import { cleanHtml } from '../utils/helpers.js';

const API_KEY = process.env.STACK_OVERFLOW_API_KEY;

function extractKeySolution(answerBody: string, maxLines: number = 7): string {
  let text = cleanHtml(answerBody);
  
  // Split into lines and filter out empty lines
  const lines = text.split('\n').filter((line: string) => line.trim().length > 0);
  
  let keyLines: string[] = [];
  let inCodeBlock = false;

  for (let i = 0; i < lines.length && keyLines.length < maxLines; i++) {
    const line = lines[i].trim();
    
    // Skip very short lines or markdown headers
    if (line.length < 15 || line.startsWith('#') || line.match(/^={3,}$/)) continue;
    
    // Track code blocks
    if (line.includes('```')) {
      inCodeBlock = !inCodeBlock;
      continue;
    }
    
    // Prioritize lines that look like solutions
    const isSolutionLine = 
      line.includes('solution') || 
      line.includes('fix') || 
      line.includes('error') ||
      line.includes('correct') ||
      line.includes('should be') ||
      line.includes('change') ||
      line.includes('instead') ||
      inCodeBlock ||
      (line.includes('=') && line.includes(';')) || // Looks like code
      (line.includes('function') && line.includes('(')) || // Function definition
      (line.includes('{') && line.includes('}')); // Code block

    if (isSolutionLine || i < 3) { // Always take first few lines
      keyLines.push(line);
    }
  }

  let result = keyLines.join('\n');
  if (result.length > 600) {
    result = result.substring(0, 600) + "...";
  }
  return result || "No specific solution text extracted.";
}

export async function searchStackOverflow(error: string): Promise<string | null> {
  try {
    logInfo(`Searching: "${error}"`, 'StackOverflow');

    // Clean and prepare the error for search
    const cleanError = error
      .replace(/[^\w\s]/g, ' ') // Remove special chars but keep spaces
      .replace(/\s+/g, ' ')    // Collapse multiple spaces
      .trim();

    // Build a more targeted search query
    const searchTerms = [
      `"${cleanError}"`, // Exact match
      cleanError.split(' ').slice(0, 5).join(' '), // First few words
    ].filter(term => term.length > 3);

    const searchQuery = searchTerms.join(' OR ');
    
    const params = new URLSearchParams({
      order: 'desc',
      sort: 'relevance', // Changed from 'votes' to 'relevance'
      q: searchQuery,
      site: 'stackoverflow',
      key: API_KEY || '',
      pagesize: '5', // Get more results to filter
      answers: '1',
      filter: 'withbody'
    });

    const response = await axios.get(
      `https://api.stackexchange.com/2.3/search/advanced?${params}`,
      { timeout: 15000 }
    );

    const items = response.data.items || [];

    if (items.length === 0) {
      logInfo(`No results found for: "${error}"`, 'StackOverflow');
      return null;
    }

    // Better relevance scoring
    const scoredItems = items.map((item: any) => {
      let score = item.score || 0;
      
      // Boost score for title matches
      const title = item.title.toLowerCase();
      const errorLower = error.toLowerCase();
      
      if (title.includes(errorLower)) score += 100;
      if (title.includes(cleanError.toLowerCase())) score += 50;
      
      // Boost for exact error type matches
      const errorType = extractErrorType(error);
      if (title.includes(errorType.toLowerCase())) score += 30;
      
      // Boost for programming language tags
      const langTags = ['javascript', 'python', 'node.js', 'typescript', 'java'];
      if (item.tags && item.tags.some((tag: string) => langTags.includes(tag))) {
        score += 20;
      }

      return { ...item, relevanceScore: score };
    });

    // Sort by relevance score
    scoredItems.sort((a: any, b: any) => b.relevanceScore - a.relevanceScore);

    // Get the most relevant question
    const question = scoredItems[0];

    // Get answers for the question
    const answerParams = new URLSearchParams({
      order: 'desc',
      sort: 'votes',
      site: 'stackoverflow',
      key: API_KEY || '',
      pagesize: '3', // Get top 3 answers
      filter: 'withbody'
    });

    const answerResponse = await axios.get(
      `https://api.stackexchange.com/2.3/questions/${question.question_id}/answers?${answerParams}`,
      { timeout: 15000 }
    );

    const answers = answerResponse.data.items || [];
    
    if (answers.length === 0) {
      return `📝 ${question.title}\n\nℹ️ No answers yet. Visit for potential solutions:\n🔗 https://stackoverflow.com/q/${question.question_id}`;
    }

    // Use the highest voted answer
    const topAnswer = answers[0];
    const keySolution = extractKeySolution(topAnswer.body, 8);
    
    return `📝 ${question.title}\n\n⭐ Top Answer (Score: ${topAnswer.score})\n\n${keySolution}\n\n🔗 https://stackoverflow.com/a/${topAnswer.answer_id}`;

  } catch (error: any) {
    logError(`StackOverflow search failed: ${error.message}`, 'StackOverflow');
    return null;
  }
}

// Helper function to extract error type
function extractErrorType(error: string): string {
  const match = error.match(/(\w+Error):/);
  return match ? match[1] : 'UnknownError';
}
