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
    usage: 'GET /api/snipe?error=YOUR_ERROR'
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
