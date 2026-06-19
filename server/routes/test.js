import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Test endpoint that doesn't use database
router.get('/sample', async (req, res) => {
  try {
    // Read sample data directly from file
    const sampleDataPath = path.join(__dirname, '../data/sampleComponents.json');
    const data = await fs.readFile(sampleDataPath, 'utf8');
    const { components } = JSON.parse(data);
    
    // Simple scoring logic without database
    const scoredComponents = components.map(comp => ({
      ...comp,
      reuseScore: Math.floor(Math.random() * 40) + 60, // Random score 60-100
      category: 'Reusable'
    }));
    
    const summary = {
      total: scoredComponents.length,
      reusable: scoredComponents.length,
      recyclable: 0,
      waste: 0,
      salvageValue: 150000,
      co2Savings: 284
    };
    
    res.json({
      components: scoredComponents,
      summary
    });
    
  } catch (error) {
    console.error('Test endpoint error:', error);
    res.status(500).json({ error: 'Failed to load sample data' });
  }
});

export default router;
