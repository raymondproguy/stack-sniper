// src/controller/snipe.ts
import { Request, Response } from 'express';
import { validateError } from '../utils/helpers.js';
import { searchStackOverflow } from '../services/stackoverflow4.js';
import { logInfo, logSuccess, logError } from '../utils/logger.js';
import { HistoryService } from '../history/history.service.js';

const historyService = new HistoryService();

// Helper functions
function extractErrorType(error: string): string {
  const match = error.match(/(\w+Error):/);
  return match ? match[1] : 'UnknownError';
}

function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

export async function snipeController(req: Request, res: Response) {
  const startTime = Date.now();
  try {
    const { error } = req.query;

    // Validate input
    const validationError = validateError(error as string);
    if (validationError) {
      return res.status(400).json({
        success: false,
        error: validationError
      });
    }

    logInfo(`Processing: "${error}"`, 'SnipeController');

    // Search Stack Overflow
    const solution = await searchStackOverflow(error as string);
    const responseTime = Date.now() - startTime;

    let finalSolution: string;
    if (!solution) {
      finalSolution = `No solutions found for "${error}". Try a different error message or check the spelling.`;
    } else {
      finalSolution = solution;
    }

    // Save to history if user is authenticated
    if (req.user) {
      await historyService.saveHistoryWithPerformance({
        userId: req.user.uid,
        feature: 'snipe',
        query: error as string,
        response: finalSolution,
        source: 'stackoverflow',
        metadata: {
          errorType: extractErrorType(error as string),
          codeLanguage: 'unknown',
          tokensUsed: estimateTokens(finalSolution),
          hasSolution: solution !== null
        }
      }, responseTime);
    }

    const response = {
      success: true,
      error: error,
      solution: finalSolution,
      source: 'Stack Overflow',
      responseTime
    };

    logSuccess(`Completed in ${responseTime}ms`, 'SnipeController');
    res.json(response);
  } catch (error: any) {
    logError(`Snipe controller failed: ${error.message}`, 'SnipeController');
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}
