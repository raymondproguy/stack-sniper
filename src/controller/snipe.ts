import { validateError } from '../utils/helpers.js';
import { searchStackOverflow } from '../services/stackoverflow.js';
import { logInfo, logSuccess } from '../utils/logger.js';

export async function snipeController(req, res) {
  const startTime = Date.now();
  
  try {
    const { error } = req.query;

    // Validate input
    const validationError = validateError(error);
    if (validationError) {
      return res.status(400).json({
        success: false,
        error: validationError
      });
    }

    logInfo(`Processing: "${error}"`, 'SnipeController');

    // Search Stack Overflow
    const solution = await searchStackOverflow(error);

    if (!solution) {
      return res.json({
        success: true,
        error: error,
        solution: `No solutions found for "${error}". Try a different error message.`,
        source: 'Stack Overflow'
      });
    }

    const response = {
      success: true,
      error: error,
      solution: solution,
      source: 'Stack Overflow'
    };

    logSuccess(`Completed in ${Date.now() - startTime}ms`, 'SnipeController');
    res.json(response);

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}
