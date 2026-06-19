import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import analysisRoutes from './routes/analysis.js';
import wasteRoutes from './routes/waste.js';
import testRoutes from './routes/test.js';
import constructionRoutes from './routes/construction.js';
import configRoutes from './routes/config.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/analysis', analysisRoutes);
app.use('/api/waste', wasteRoutes);
app.use('/api/test', testRoutes);
app.use('/api/construction', constructionRoutes);
app.use('/api/config', configRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'UrbanMine AI Server is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 UrbanMine AI Server running on port ${PORT}`);
  console.log(`📊 API endpoints available at http://localhost:${PORT}/api`);
  console.log('✅ MongoDB disabled - using in-memory processing');
});
