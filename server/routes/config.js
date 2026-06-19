import express from 'express';

const router = express.Router();

// Get default configuration
router.get('/default', (req, res) => {
  try {
    const defaultConfig = {
      materials: [
        { name: 'Steel', baseValue: 200, co2Factor: 1.8, reusabilityScore: 20, recyclable: true, color: '#8B8C89', texture: 'metallic' },
        { name: 'Aluminum', baseValue: 150, co2Factor: 1.2, reusabilityScore: 18, recyclable: true, color: '#C0C0C0', texture: 'brushed-metal' },
        { name: 'Wood', baseValue: 80, co2Factor: 0.3, reusabilityScore: 15, recyclable: true, color: '#8B4513', texture: 'wood-grain' },
        { name: 'Glass', baseValue: 100, co2Factor: 0.8, reusabilityScore: 12, recyclable: true, color: '#87CEEB', texture: 'transparent' },
        { name: 'Metal', baseValue: 120, co2Factor: 1.5, reusabilityScore: 15, recyclable: true, color: '#708090', texture: 'metallic' },
        { name: 'Gypsum', baseValue: 20, co2Factor: 0.2, reusabilityScore: 5, recyclable: true, color: '#F5F5DC', texture: 'smooth' },
        { name: 'PVC', baseValue: 15, co2Factor: 0.4, reusabilityScore: 3, recyclable: false, color: '#FFFFFF', texture: 'plastic' },
        { name: 'Ceramic', baseValue: 40, co2Factor: 0.6, reusabilityScore: 8, recyclable: true, color: '#F5F5DC', texture: 'smooth' },
        { name: 'Concrete', baseValue: 10, co2Factor: 0.1, reusabilityScore: 2, recyclable: true, color: '#808080', texture: 'rough' },
      ],
      connectionTypes: [
        { name: 'Bolted', score: 15, description: 'Easy to disassemble with standard tools', difficulty: 'Easy' },
        { name: 'Screwed', score: 12, description: 'Relatively easy to remove with screwdriver', difficulty: 'Easy' },
        { name: 'Clipped', score: 10, description: 'Simple clip mechanism for quick removal', difficulty: 'Easy' },
        { name: 'Welded', score: 5, description: 'Requires cutting tools for removal', difficulty: 'Hard' },
        { name: 'Glued', score: -10, description: 'Difficult to separate without damage', difficulty: 'Hard' },
        { name: 'Adhesive', score: -15, description: 'Permanent bond, not reusable', difficulty: 'Hard' },
        { name: 'Nailed', score: 8, description: 'Can be removed with nail puller', difficulty: 'Medium' },
        { name: 'Clamped', score: 10, description: 'Temporary fixture, easy to remove', difficulty: 'Easy' },
      ]
    };
    
    res.json(defaultConfig);
  } catch (error) {
    console.error('Config error:', error);
    res.status(500).json({ error: 'Failed to fetch default configuration' });
  }
});

export default router;
