import express from 'express';
// import Component from '../models/Component.js';
import { processComponents } from '../services/reusabilityScorer.js';
import { generateDeconstructionPlan } from '../services/aiService.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Get all components
router.get('/components', async (req, res) => {
  try {
    // Return empty array since we're not using database
    res.json([]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch components' });
  }
});

// Upload and analyze components
router.post('/analyze', async (req, res) => {
  try {
    const { components, userConfig } = req.body;
    
    if (!components || !Array.isArray(components)) {
      return res.status(400).json({ error: 'Invalid components data' });
    }
    
    // Use user config if provided, otherwise use defaults
    const config = userConfig || {
      materials: [
        { name: 'Steel', baseValue: 200, co2Factor: 1.8, reusabilityScore: 20 },
        { name: 'Aluminum', baseValue: 150, co2Factor: 1.2, reusabilityScore: 18 },
        { name: 'Wood', baseValue: 80, co2Factor: 0.3, reusabilityScore: 15 },
        { name: 'Glass', baseValue: 100, co2Factor: 0.8, reusabilityScore: 12 },
        { name: 'Metal', baseValue: 120, co2Factor: 1.5, reusabilityScore: 15 },
        { name: 'Gypsum', baseValue: 20, co2Factor: 0.2, reusabilityScore: 5 },
        { name: 'PVC', baseValue: 15, co2Factor: 0.4, reusabilityScore: 3 },
        { name: 'Ceramic', baseValue: 40, co2Factor: 0.6, reusabilityScore: 8 },
        { name: 'Concrete', baseValue: 10, co2Factor: 0.1, reusabilityScore: 2 },
        { name: 'Brick', baseValue: 30, co2Factor: 0.4, reusabilityScore: 10 },
        { name: 'Copper', baseValue: 400, co2Factor: 2.5, reusabilityScore: 25 },
        { name: 'Plastic', baseValue: 25, co2Factor: 0.5, reusabilityScore: 5 }
      ],
      connectionTypes: [
        { name: 'Bolted', score: 15 },
        { name: 'Screwed', score: 12 },
        { name: 'Clipped', score: 10 },
        { name: 'Welded', score: 5 },
        { name: 'Glued', score: -10 },
        { name: 'Adhesive', score: -15 },
        { name: 'Nailed', score: 8 },
        { name: 'Interlocking', score: 14 },
        { name: 'Cast-in-place', score: -20 }
      ]
    };
    
    // Process components with scoring
    const processedComponents = components.map(component => {
      // Simple scoring logic
      let reuseScore = 50; // Base score
      
      const primaryMaterial = component.material.split('+')[0].trim();
      
      // Material scoring using user config
      const materialConfig = config.materials.find(m => 
        m.name.toLowerCase() === primaryMaterial.toLowerCase()
      );
      
      if (materialConfig) {
        reuseScore += materialConfig.reusabilityScore;
      }
      
      // Connection type scoring using user config
      const connectionConfig = config.connectionTypes.find(c => 
        c.name.toLowerCase() === component.connectionType.toLowerCase()
      );
      
      if (connectionConfig) {
        reuseScore += connectionConfig.score;
      }
      
      // Condition scoring - Penalize Damaged and Poor components heavily
      const conditionScores = {
        'Good': 15,
        'Fair': 5,
        'Poor': -30,
        'Damaged': -20
      };
      
      reuseScore += conditionScores[component.condition] || 0;
      
      // Age deduction
      const ageDeduction = Math.min((component.estimatedAge || 0) * 0.5, 15);
      reuseScore -= ageDeduction;
      
      // Ensure score stays within bounds
      reuseScore = Math.max(0, Math.min(100, reuseScore));
      
      // Determine category with strict safety overrides
      let category = 'Waste';
      
      // Safety Override: Poor or Damaged condition ALWAYS goes to waste
      if (['Poor', 'Damaged'].includes(component.condition)) {
        category = 'Waste';
      } else if (component.condition === 'Fair') {
        // Fair condition materials are primarily recyclable unless they have very high scores
        category = reuseScore >= 70 ? 'Reusable' : 'Recyclable';
      } else if (reuseScore >= 75) {
        category = 'Reusable';
      } else if (reuseScore >= 45) {
        category = 'Recyclable';
      } else {
        category = 'Waste';
      }
      
      // Generate reason
      const reasons = [];
      
      // Poor condition automatically requires disposal
      if (component.condition === 'Poor') {
        reasons.push('Poor condition requires safe disposal');
        reasons.push('Material integrity compromised for reuse');
      } else if (component.condition === 'Fair') {
        reasons.push('Fair condition suitable for recycling');
        reasons.push('Material can be processed and reused in new forms');
      } else {
        if (materialConfig && ['Steel', 'Aluminum', 'Wood'].includes(materialConfig.name)) {
          reasons.push(`${materialConfig.name} is highly reusable`);
        }
        if (connectionConfig && connectionConfig.name === 'Bolted') {
          reasons.push('Bolted connection allows easy removal');
        }
        if (component.condition === 'Good') {
          reasons.push('Good condition preserves value');
        }
      }
      
      return {
        ...component,
        reuseScore: Math.round(reuseScore),
        category,
        reason: reasons.join('. ') || 'Standard component analysis'
      };
    });
    
    // Calculate summary statistics
    const total = processedComponents.length;
    const reusable = processedComponents.filter(c => c.category === 'Reusable').length;
    const recyclable = processedComponents.filter(c => c.category === 'Recyclable').length;
    const waste = processedComponents.filter(c => c.category === 'Waste').length;
    
    // Calculate estimated salvage value using user config
    const salvageValue = processedComponents.reduce((total, comp) => {
      let value = 0;
      const primaryMaterial = comp.material.split('+')[0].trim();
      const materialConfig = config.materials.find(m => 
        m.name.toLowerCase() === primaryMaterial.toLowerCase()
      );
      
      const baseValue = materialConfig ? materialConfig.baseValue : 50;
      value = baseValue * comp.quantity * (comp.reuseScore / 100);
      
      return total + value;
    }, 0);
    
    // Calculate CO2 savings using user config
    const co2Savings = processedComponents.reduce((total, comp) => {
      const primaryMaterial = comp.material.split('+')[0].trim();
      const materialConfig = config.materials.find(m => 
        m.name.toLowerCase() === primaryMaterial.toLowerCase()
      );
      
      const co2PerUnit = materialConfig ? materialConfig.co2Factor : 0.5;
      return total + (co2PerUnit * comp.quantity * (comp.reuseScore / 100));
    }, 0);
    
    const summary = {
      total,
      reusable,
      recyclable,
      waste,
      salvageValue: Math.round(salvageValue),
      co2Savings: Math.round(co2Savings * 10) / 10
    };
    
    res.json({
      components: processedComponents,
      summary
    });
    
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze components' });
  }
});

// Load sample data
router.get('/sample', async (req, res) => {
  try {
    const sampleDataPath = path.join(__dirname, '../data/sampleComponents.json');
    const data = await fs.readFile(sampleDataPath, 'utf8');
    const { components } = JSON.parse(data);
    
    // Process with scoring
    const processedComponents = processComponents(components);
    const summary = calculateSummary(processedComponents);
    
    // Skip database save since we're not using MongoDB
    console.log('✅ Sample data processed (database skipped)');
    
    res.json({
      components: processedComponents,
      summary
    });
    
  } catch (error) {
    console.error('Sample data error:', error);
    res.status(500).json({ error: 'Failed to load sample data' });
  }
});

// Generate AI deconstruction plan
router.post('/deconstruction-plan', async (req, res) => {
  try {
    const { components } = req.body;
    
    if (!components || !Array.isArray(components)) {
      return res.status(400).json({ error: 'Invalid components data' });
    }
    
    const plan = await generateDeconstructionPlan(components);
    res.json(plan);
    
  } catch (error) {
    console.error('Deconstruction plan error:', error);
    res.status(500).json({ error: 'Failed to generate deconstruction plan' });
  }
});

// Helper function to calculate summary statistics
function calculateSummary(components) {
  const total = components.length;
  const reusable = components.filter(c => c.category === 'Reusable').length;
  const recyclable = components.filter(c => c.category === 'Recyclable').length;
  const waste = components.filter(c => c.category === 'Waste').length;
  
  // Calculate estimated salvage value (simplified)
  const salvageValue = components.reduce((total, comp) => {
    let value = 0;
    const materialValue = {
      'Steel': 200,
      'Aluminum': 150,
      'Wood': 80,
      'Glass': 100,
      'Metal': 120,
      'Gypsum': 20,
      'PVC': 15,
      'Ceramic': 40,
      'Concrete': 10
    };
    
    const primaryMaterial = comp.material.split('+')[0].trim();
    const baseValue = materialValue[primaryMaterial] || 50;
    value = baseValue * comp.quantity * (comp.reuseScore / 100);
    
    return total + value;
  }, 0);
  
  // Calculate CO2 savings (simplified estimation)
  const co2Savings = components.reduce((total, comp) => {
    const materialCO2 = {
      'Steel': 1.8,
      'Aluminum': 1.2,
      'Wood': 0.3,
      'Glass': 0.8,
      'Metal': 1.5,
      'Gypsum': 0.2,
      'PVC': 0.4,
      'Ceramic': 0.6,
      'Concrete': 0.1
    };
    
    const primaryMaterial = comp.material.split('+')[0].trim();
    const co2PerUnit = materialCO2[primaryMaterial] || 0.5;
    return total + (co2PerUnit * comp.quantity * (comp.reuseScore / 100));
  }, 0);
  
  return {
    total,
    reusable,
    recyclable,
    waste,
    salvageValue: Math.round(salvageValue),
    co2Savings: Math.round(co2Savings * 10) / 10
  };
}

export default router;
