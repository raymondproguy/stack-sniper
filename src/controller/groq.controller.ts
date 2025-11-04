import { GroqService } from '../services/groq.service'; // Change import
import { estimateTokens, extractErrorType, cleanAIResponse } from "../utils/aiHelpers.js"
import { logInfo, logError } from '../utils/logger.js';
import { HistoryService } from '../history/history.service.js';

const groq = new GroqService(); // Change to GroqService
const historyService = new HistoryService();

// Remove duplicate cleanAIResponse function (you're importing it)

export async function debugController(req: Request, res: Response) {
  const startTime = Date.now();
  try {
    const { error, code } = req.query;

    if (!error) {
      return res.status(400).json({
        success: false,
        error: 'Error parameter is required'
      });
    }

    logInfo(`AI Debug: ${error}`, 'AIController');

    const solution = await groq.debugError(error as string, code as string); // Use groq
    const cleanSolution = cleanAIResponse(solution);
    const responseTime = Date.now() - startTime; // Fixed: Date.now()

    // Save to history
    await historyService.saveHistoryWithPerformance({
      userId: req.user?.uid || 'anonymous', // Add fallback
      feature: 'debug',
      query: `Error: ${error}${code ? `\nCode: ${code}` : ''}`,
      response: cleanSolution,
      source: 'ai',
      metadata: {
        errorType: extractErrorType(error as string),
        codeLanguage: 'javascript',
        tokensUsed: estimateTokens(cleanSolution) // Fixed: use cleanSolution
      }
    }, responseTime);

    res.json({
      success: true,
      error: error,
      solution: cleanSolution,
      source: 'Groq AI', // Updated source
      responseTime
    });

  } catch (error: any) {
    logError(`AI Debug failed: ${error.message}`, 'AIController');
    res.status(500).json({
      success: false,
      error: 'AI service unavailable'
    });
  }
}

export async function reviewController(req: Request, res: Response) {
  const startTime = Date.now();
  try {
    const { code } = req.query;

    if (!code) {
      return res.status(400).json({ // Fixed: status not staitus
        success: false,
        error: 'Code parameter is required'
      });
    }

    logInfo('AI Code Review', 'AIController');

    const review = await groq.reviewCode(code as string); // Use groq
    const cleanReview = cleanAIResponse(review);
    const responseTime = Date.now() - startTime; // Fixed: Date.now()

    // Save to history
    await historyService.saveHistory({
      userId: req.user?.uid || 'anonymous',
      feature: 'review',
      query: `Code Review: ${code}`, // Fixed: removed undefined 'error'
      response: cleanReview, // Fixed: cleanReview not cleanResponse
      source: 'ai',
      metadata: {
        codeLanguage: 'javascript',
        tokensUsed: estimateTokens(cleanReview) // Fixed: use cleanReview
      }
    });

    res.json({
      success: true,
      review: cleanReview,
      source: 'Groq AI', // Updated source
      responseTime
    });

  } catch (error: any) {
    logError(`AI Review failed: ${error.message}`, 'AIController');
    res.status(500).json({
      success: false,
      error: 'AI service unavailable'
    });
  }
}

export async function rewriteController(req: Request, res: Response) {
  const startTime = Date.now();
  try {
    const { code, instructions } = req.query;

    if (!code) {
      return res.status(400).json({
        success: false,
        error: 'Code parameter is required'
      });
    }

    logInfo('AI Code Rewrite', 'AIController');

    const rewritten = await groq.rewriteCode(code as string, instructions as string); // Use groq
    const cleanRewritten = cleanAIResponse(rewritten);
    const responseTime = Date.now() - startTime; // Fixed: Date.now()

    // Save to history
    await historyService.saveHistory({
      userId: req.user?.uid || 'anonymous',
      feature: 'rewrite',
      query: `Rewrite: ${code}${instructions ? `\nInstructions: ${instructions}` : ''}`, // Fixed query
      response: cleanRewritten, // Fixed: cleanRewritten not cleanResponse
      source: 'ai',
      metadata: {
        codeLanguage: 'javascript',
        tokensUsed: estimateTokens(cleanRewritten) // Fixed: use cleanRewritten
      }
    });

    res.json({
      success: true,
      original: code,
      rewritten: cleanRewritten,
      source: 'Groq AI', // Updated source
      responseTime
    });

  } catch (error: any) {
    logError(`AI Rewrite failed: ${error.message}`, 'AIController');
    res.status(500).json({
      success: false,
      error: 'AI service unavailable'
    });
  }
}

export async function explainController(req: Request, res: Response) {
  const startTime = Date.now();
  try {
    const { concept } = req.query;

    if (!concept) {
      return res.status(400).json({
        success: false,
        error: 'Concept parameter is required'
      });
    }

    logInfo(`AI Explain: ${concept}`, 'AIController');

    const explanation = await groq.explainConcept(concept as string); // Use groq
    const cleanExplanation = cleanAIResponse(explanation);
    const responseTime = Date.now() - startTime; // Fixed: Date.now()

    // Save to history
    await historyService.saveHistory({
      userId: req.user?.uid || 'anonymous',
      feature: 'explain',
      query: `Explain: ${concept}`, // Fixed query
      response: cleanExplanation, // Fixed: cleanExplanation not cleanResponse
      source: 'ai',
      metadata: {
        tokensUsed: estimateTokens(cleanExplanation) // Fixed: use cleanExplanation
      }
    });

    res.json({
      success: true,
      concept: concept,
      explanation: cleanExplanation,
      source: 'Groq AI', // Updated source
      responseTime
    });

  } catch (error: any) {
    logError(`AI Explain failed: ${error.message}`, 'AIController');
    res.status(500).json({
      success: false,
      error: 'AI service unavailable'
    });
  }
}
