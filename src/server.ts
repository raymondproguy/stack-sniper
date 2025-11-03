import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { logSuccess } from "../src/utils/logger";
import snipeRoutes from "../src/routers/route";
import aiRoute from "../src/routers/deepseek.route";
//import { connectDB } from './config/database';
import authRoutes from "../src/auth/auth.route";
import historyRoutes from "../src/history/history.routes";
//import adminRouts from "../src/admin/admin.routes";

dotenv.config();
//connectDB();

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
  logSuccess(`Root endpoint accessed`, 'Root')
});

app.use('/api', snipeRoutes);
app.use('/api/ai', aiRoute);
app.use('api/auth', authRoutes);
app.use('api/history', historyRoutes);
//app.use('api/admin', adminRouts);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
  logSuccess(`Health check`, 'Health');
});

app.listen(PORT, () => {
  logSuccess(`Server running on http://localhost:${PORT}`, 'Server');
});
