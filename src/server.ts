import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
//import { logSuccess } from './utils/logger.js';
//import { getSolution } from './controllers/snipe.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());

// Routes - LSP helps with express app methods
app.get('/', (req, res) => {
  res.json({
    message: '🚀 StackSniper API',
    usage: 'GET /api/snipe?error=YOUR_ERROR'
  });
});

//app.get('/api/snipe', getSolution);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`, 'Server');
});
