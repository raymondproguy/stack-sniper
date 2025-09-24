import axios from 'axios';
import { logInfo, logError } from '../utils/logger.js';
import { cleanHtml } from '../utils/helpers.js';

const API_KEY = process.env.STACK_OVERFLOW_API_KEY;

export async function searchStackOverflow(error) {
  try {
    logInfo(`Searching: "${error}"`, 'StackOverflow');
    
    const params = new URLSearchParams({
      order: 'desc',
      sort: 'relevance',
      q: error,
      site: 'stackoverflow',
      key: API_KEY,
      pagesize: '1',
      answers: '1'
    });

    const response = await axios.get(
      `https://api.stackexchange.com/2.3/search/advanced?${params}`,
      { timeout: 10000 }
    );

    const items = response.data.items || [];
    
    if (items.length === 0) {
      return null;
    }

    const question = items[0];
    
    // Get answers for the question
    const answersParams = new URLSearchParams({
      order: 'desc',
      sort: 'votes',
      site: 'stackoverflow',
      key: API_KEY,
      pagesize: '1'
    });

    const answersResponse = await axios.get(
      `https://api.stackexchange.com/2.3/questions/${question.question_id}/answers?${answersParams}`,
      { timeout: 10000 }
    );

    const answers = answersResponse.data.items || [];
    const topAnswer = answers[0];

    let solution = `🔍 ${question.title}\n\n`;
    
    if (topAnswer) {
      solution += `⭐ Score: ${topAnswer.score}\n\n`;
      solution += cleanHtml(topAnswer.body);
    } else {
      solution += `🔗 https://stackoverflow.com/q/${question.question_id}\n`;
      solution += `Visit for solutions.`;
    }

    return solution;

  } catch (error) {
    logError(`API call failed: ${error.message}`, 'StackOverflow');
    return null;
  }
}
