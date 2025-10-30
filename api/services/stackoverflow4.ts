rt axios from 'axios';
import { logInfo, logError } from '../utils/logger.js';
import { cleanHtml } from '../utils/helpers.js';

const API_KEY = process.env.STACK_OVERFLOW_API_KEY;

function extractKeySolution(answerBody: string, maxLines: number = 7): string {
  // Clean the HTML first
  let text = cleanHtml(answerBody);

  // Split into lines and filter out empty lines
  const lines = text.split('\n').filter((line: string) => line.trim().length > 0);

  // Look for the most important part (usually the first few lines with code or key explanation)
  let keyLines: string[] = [];
  
  // Try to find the most relevant section (usually at the beginning)
  for (let i = 0; i < Math.min(lines.length, maxLines + 3); i++) {
    const line = lines[i].trim();

    // Skip very short lines or lines that are just punctuation
    if (line.length < 10) continue;

    // Look for lines that contain actual explanations or code
    if (line.includes('```') || line.includes('`') || 
        line.includes('error') || line.includes('fix') || 
        line.includes('solution') || line.includes('cause') || 
        /[a-zA-Z][.,]/.test(line)) {
      keyLines.push(line);
      if (keyLines.length >= maxLines) break;
    }
  }

  // If we didn't find good lines, just take the first few non-empty ones
  if (keyLines.length === 0) {
    keyLines = lines.slice(0, maxLines).filter((line: string) => line.trim().length > 0);
  }

  // Join with newlines and truncate if still too long
  let result = keyLines.join('\n');
  if (result.length > 500) {
    result = result.substring(0, 500) + "...";
  }
  return result;
}

export async function searchStackOverflow(error: string): Promise<string | null> {
  try {
    logInfo(`Searching: "${error}"`, 'StackOverflow');
    
    const searchQuery = `"${error}" [javascript] OR "${error}" [python] OR "${error}" [node.js] OR "${error}" [typescript]`;
    const params = new URLSearchParams({
      order: 'desc',
      sort: 'votes',
      q: searchQuery,
      site: 'stackoverflow',
      key: API_KEY || '',
      pagesize: '3',
      answers: '1',
      filter: 'withbody'
    });

    const response = await axios.get(
      `https://api.stackexchange.com/2.3/search/advanced?${params}`,
      { timeout: 10000 }
    );

    const items = response.data.items || [];

    if (items.length === 0) {
      return null;
    }

    // Filter for relevant results
    const relevantItems = items.filter((item: any) => {
      const titleMatch = item.title.toLowerCase().includes(error.toLowerCase());
      const hasRelevantTags = item.tags && item.tags.some((tag: string) =>
        ['javascript', 'python', 'node.js', 'typescript', 'java', 'c#', 'php', 'ruby'].includes(tag)
      );
      return titleMatch || hasRelevantTags;
    });

    if (relevantItems.length === 0) {
      return null;
    }

    // Get the highest scored question
    const question = relevantItems.sort((a: any, b: any) => b.score - a.score)[0];

    // Get answers for the question
    const answerParams = new URLSearchParams({
      order: 'desc',
      sort: 'votes',
      site: 'stackoverflow',
      key: API_KEY || '',
      pagesize: '1',
      filter: 'withbody'
    });

    const answerResponse = await axios.get(
      `https://api.stackexchange.com/2.3/questions/${question.question_id}/answers?${answerParams}`,
      { timeout: 10000 }
    );

    const answers = answerResponse.data.items || [];
    const topAnswer = answers[0];

    if (topAnswer) {
      const keySolution = extractKeySolution(topAnswer.body, 5);
      return `📝 ${question.title}\n\n⭐ Top Answer (Score: ${topAnswer.score})\n\n${keySolution}\n\n🔗 https://stackoverflow.com/a/${topAnswer.answer_id}`;
    } else {
      return `📝 ${question.title}\n\nℹ️ No top answer yet. Visit for solutions:\n🔗 https://stackoverflow.com/q/${question.question_id}`;
    }
  } catch (error: any) {
    logError(`StackOverflow search failed: ${error.message}`, 'StackOverflow');
    return null;
  }
}
