import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { logSuccess } from "../src/utils/logger"
import snipeRoutes from "../src/routers/route"
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    message: '🚀 StackSniper API',

    usage: {
     stackOverflow: 'GET /api/snipe?error=YOUR_ERROR',
    aiDebug: 'GET /api/ai/debug?error=ERROR&code=OPTIONAL_CODE',
      aiReview: 'GET /api/ai/review?code=YOUR_CODE',
    aiRewrite: 'GET /api/ai/rewrite?code=CODE&instructions=OPTIONAL'
    }
  });
});

app.use('/api', snipeRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  logSuccess(`Server running on http://localhost:${PORT}`, 'Server');
});
