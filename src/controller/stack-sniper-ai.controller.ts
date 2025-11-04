// controllers/stack-sniper-ai.controller.ts
import { Request, Response } from 'express';
import { StackSniperAIService } from '../services/stack-sniper-ai.service.js';
import { HistoryService } from '../history/history.service.js';
import { logInfo, logError } from '../utils/logger.js';

const aiService = new StackSniperAIService();
const historyService = new HistoryService();

export async function aiChatController(req: Request, res: Response) {
  const startTime = Date.now();
  try {
    const { message, context } = req.body;
    const userId = req.user?.uid || 'anonymous';

    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }

    logInfo(`AI Chat from ${userId}: ${message}`, 'AIChatController');

    // Get AI response
    const aiResponse = await aiService.chat(message, {
      userId,
      ...context
    });

    const responseTime = Date.now() - startTime;

    // Save to history
    await historyService.saveHistory({
      userId,
      feature: 'ai-chat',
      query: `AI Chat: ${message.substring(0, 100)}...`,
      response: aiResponse.substring(0, 500) + (aiResponse.length > 500 ? '...' : ''),
      source: 'stack-sniper-ai',
      metadata: {
        responseTime,
        messageLength: message.length,
        responseLength: aiResponse.length
      }
    });

    res.json({
      success: true,
      response: aiResponse,
      responseTime,
      source: 'StackSniper AI'
    });

  } catch (error: any) {
    logError(`AI Chat failed: ${error.message}`, 'AIChatController');
    res.status(500).json({
      success: false,
      error: 'AI service temporarily unavailable'
    });
  }
}

export async function quickHelpController(req: Request, res: Response) {
  try {
    const { problem, code } = req.query;

    if (!problem) {
      return res.status(400).json({
        success: false,
        error: 'Problem description is required'
      });
    }

    const help = await aiService.getCodingHelp(problem as string, code as string);
    
    res.json({
      success: true,
      help,
      source: 'StackSniper AI'
    });

  } catch (error: any) {
    logError(`Quick help failed: ${error.message}`, 'AIHelpController');
    res.status(500).json({
      success: false,
      error: 'Help service unavailable'
    });
  }
}
