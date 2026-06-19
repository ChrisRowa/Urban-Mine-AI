import express from 'express';

const router = express.Router();

// In-memory waste data store (no MongoDB needed)
let wasteDataStore = [];

// Get all waste data
router.get('/', (req, res) => {
  try {
    const sorted = [...wasteDataStore].sort((a, b) => (b.year || 0) - (a.year || 0));
    res.json(sorted);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch waste data' });
  }
});

// Get waste statistics
router.get('/stats', (req, res) => {
  try {
    const result = wasteDataStore.reduce((acc, item) => {
      acc.totalWasteGenerated += item.total_waste_generated_tonne || 0;
      acc.totalWasteRecycled += item.total_waste_recycled_tonne || 0;
      acc.totalWasteDisposed += item.waste_disposed_of_tonne || 0;
      acc.avgRecyclingRate += item.recycling_rate || 0;
      return acc;
    }, {
      totalWasteGenerated: 0,
      totalWasteRecycled: 0,
      totalWasteDisposed: 0,
      avgRecyclingRate: 0
    });

    if (wasteDataStore.length > 0) {
      result.avgRecyclingRate = result.avgRecyclingRate / wasteDataStore.length;
    }

    // Calculate potential savings with UrbanMine AI
    const potentialSavings = {
      co2Savings: result.totalWasteRecycled * 0.5,
      economicValue: result.totalWasteRecycled * 100,
      landfillAvoidance: result.totalWasteRecycled
    };

    res.json({ ...result, potentialSavings });
  } catch (error) {
    res.status(500).json({ error: 'Failed to calculate waste statistics' });
  }
});

// Add waste data (for importing)
router.post('/import', (req, res) => {
  try {
    const { wasteData } = req.body;

    if (!Array.isArray(wasteData)) {
      return res.status(400).json({ error: 'Invalid waste data format' });
    }

    // Clear existing and replace with new data
    wasteDataStore = wasteData.map((item, index) => ({ ...item, _id: String(index + 1) }));

    res.json({
      message: 'Waste data imported successfully',
      count: wasteData.length
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to import waste data' });
  }
});

export default router;
