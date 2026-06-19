import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Construction templates
const constructionTemplates = [
  {
    id: 'tiny-house',
    name: 'Tiny House',
    description: 'Compact 400 sq ft living space',
    size: '400 sq ft',
    difficulty: 'Medium',
    materials: ['Steel Beams', 'Wooden Doors', 'Window Panels', 'Roofing Sheets', 'Floor Tiles'],
    estimatedCost: 15000,
    co2Savings: 8.5,
    baseRequirements: {
      'Steel': { quantity: 12, unit: 'beams' },
      'Wood': { quantity: 6, unit: 'doors' },
      'Glass': { quantity: 8, unit: 'panels' },
      'Metal': { quantity: 20, unit: 'sheets' },
      'Ceramic': { quantity: 100, unit: 'tiles' }
    }
  },
  {
    id: 'garden-shed',
    name: 'Garden Shed',
    description: 'Storage solution for backyard',
    size: '120 sq ft',
    difficulty: 'Easy',
    materials: ['Wooden Doors', 'Roofing Sheets', 'Concrete Panels'],
    estimatedCost: 3000,
    co2Savings: 2.1,
    baseRequirements: {
      'Wood': { quantity: 2, unit: 'doors' },
      'Metal': { quantity: 8, unit: 'sheets' },
      'Concrete': { quantity: 4, unit: 'panels' }
    }
  },
  {
    id: 'greenhouse',
    name: 'Greenhouse',
    description: 'Year-round growing space',
    size: '200 sq ft',
    difficulty: 'Medium',
    materials: ['Steel Beams', 'Window Panels', 'Roofing Sheets'],
    estimatedCost: 8000,
    co2Savings: 4.2,
    baseRequirements: {
      'Steel': { quantity: 8, unit: 'beams' },
      'Glass': { quantity: 15, unit: 'panels' },
      'Metal': { quantity: 12, unit: 'sheets' }
    }
  },
  {
    id: 'bus-shelter',
    name: 'Bus Shelter',
    description: 'Community infrastructure',
    size: '80 sq ft',
    difficulty: 'Easy',
    materials: ['Steel Beams', 'Roofing Sheets', 'Concrete Panels'],
    estimatedCost: 5000,
    co2Savings: 3.1,
    baseRequirements: {
      'Steel': { quantity: 6, unit: 'beams' },
      'Metal': { quantity: 10, unit: 'sheets' },
      'Concrete': { quantity: 3, unit: 'panels' }
    }
  },
  {
    id: 'playhouse',
    name: 'Playhouse',
    description: 'Children\'s outdoor structure',
    size: '100 sq ft',
    difficulty: 'Easy',
    materials: ['Wooden Doors', 'Roofing Sheets', 'Floor Tiles'],
    estimatedCost: 2500,
    co2Savings: 1.8,
    baseRequirements: {
      'Wood': { quantity: 3, unit: 'doors' },
      'Metal': { quantity: 6, unit: 'sheets' },
      'Ceramic': { quantity: 50, unit: 'tiles' }
    }
  },
  {
    id: 'storage-unit',
    name: 'Storage Unit',
    description: 'Modular storage solution',
    size: '150 sq ft',
    difficulty: 'Easy',
    materials: ['Steel Beams', 'Wooden Doors', 'Roofing Sheets'],
    estimatedCost: 4000,
    co2Savings: 2.8,
    baseRequirements: {
      'Steel': { quantity: 8, unit: 'beams' },
      'Wood': { quantity: 2, unit: 'doors' },
      'Metal': { quantity: 10, unit: 'sheets' }
    }
  }
];

// Get all construction templates
router.get('/templates', async (req, res) => {
  try {
    res.json(constructionTemplates);
  } catch (error) {
    console.error('Templates error:', error);
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
});

// Generate construction design
router.post('/design', async (req, res) => {
  try {
    const { templateId, availableMaterials, userConfig } = req.body;
    
    if (!templateId || !availableMaterials) {
      return res.status(400).json({ error: 'Template ID and materials are required' });
    }
    
    // Use user config for templates if provided, otherwise use defaults
    const config = userConfig || {
      constructorTemplates: constructionTemplates
    };
    
    // Find the template
    const allTemplates = [...constructionTemplates, ...(config.constructorTemplates || [])];
    const template = allTemplates.find(t => t.id === templateId);
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }
    
    // Filter reusable materials
    const reusableMaterials = availableMaterials.filter(m => m.category === 'Reusable');
    
    // Calculate material usage
    const materialUsage = {};
    const materialAvailability = {};
    
    // Process each required material
    Object.entries(template.baseRequirements).forEach(([material, requirement]) => {
      const availableMaterial = reusableMaterials.find(am => 
        am.material.includes(material) || am.name.includes(material)
      );
      
      if (availableMaterial) {
        const needed = Math.min(requirement.quantity, availableMaterial.quantity);
        materialUsage[material] = {
          available: availableMaterial.quantity,
          needed: needed,
          unit: requirement.unit,
          canBuild: needed >= requirement.quantity * 0.8 // 80% threshold
        };
        materialAvailability[material] = (needed / requirement.quantity) * 100;
      } else {
        materialUsage[material] = {
          available: 0,
          needed: requirement.quantity,
          unit: requirement.unit,
          canBuild: false
        };
        materialAvailability[material] = 0;
      }
    });
    
    // Calculate overall feasibility
    const canBuild = Object.values(materialUsage).every(usage => usage.canBuild);
    const completionPercentage = Math.round(
      Object.values(materialAvailability).reduce((sum, avail) => sum + avail, 0) / 
      Object.keys(materialAvailability).length
    );
    
    // Use user config for material values if provided
    const materialCostSavings = userConfig?.materials?.reduce((acc, material) => {
      acc[material.name] = material.baseValue;
      return acc;
    }, {}) || {
      'Steel': 200,
      'Wood': 80,
      'Glass': 100,
      'Metal': 120,
      'Ceramic': 40,
      'Concrete': 10
    };
    
    const recoveredValue = Object.entries(materialUsage).reduce((total, [material, usage]) => {
      const unitValue = materialCostSavings[material] || 50;
      return total + (usage.needed * unitValue);
    }, 0);
    
    const totalSavings = template.co2Savings * (completionPercentage / 100);
    const totalCost = template.estimatedCost * (1 - (recoveredValue / template.estimatedCost) * 0.8);
    
    // Generate construction steps
    const constructionSteps = generateConstructionSteps(template, materialUsage);
    
    // Generate 3D model data (simplified)
    const model3D = generate3DModelData(template, materialUsage, userConfig);
    
    const designResult = {
      template: template,
      materials: materialUsage,
      constructionSteps: constructionSteps,
      model3D: model3D,
      feasibility: {
        canBuild: canBuild,
        completionPercentage: completionPercentage,
        missingMaterials: Object.entries(materialUsage).filter(([_, usage]) => !usage.canBuild).map(([material]) => material)
      },
      costAnalysis: {
        originalCost: template.estimatedCost,
        recoveredValue: Math.round(recoveredValue),
        totalCost: Math.round(totalCost),
        savings: Math.round(template.estimatedCost - totalCost),
        savingsPercentage: Math.round(((template.estimatedCost - totalCost) / template.estimatedCost) * 100)
      },
      environmentalImpact: {
        co2Savings: Math.round(totalSavings * 10) / 10,
        treesEquivalent: Math.round(totalSavings * 40),
        carsEquivalent: Math.round(totalSavings * 62 / 240)
      }
    };
    
    res.json(designResult);
    
  } catch (error) {
    console.error('Design generation error:', error);
    res.status(500).json({ error: 'Failed to generate design' });
  }
});

// Generate construction steps
function generateConstructionSteps(template, materialUsage) {
  const baseSteps = {
    'tiny-house': [
      { step: 1, title: 'Foundation Preparation', description: 'Prepare foundation using steel beams', duration: '2 days', materials: ['Steel'] },
      { step: 2, title: 'Frame Construction', description: 'Build main structure frame', duration: '3 days', materials: ['Steel', 'Wood'] },
      { step: 3, title: 'Window Installation', description: 'Install window panels for natural light', duration: '1 day', materials: ['Glass'] },
      { step: 4, title: 'Roofing', description: 'Install roofing sheets for weather protection', duration: '2 days', materials: ['Metal'] },
      { step: 5, title: 'Flooring', description: 'Install floor tiles', duration: '2 days', materials: ['Ceramic'] },
      { step: 6, title: 'Finishing', description: 'Install doors and final touches', duration: '1 day', materials: ['Wood'] }
    ],
    'garden-shed': [
      { step: 1, title: 'Foundation', description: 'Lay concrete foundation panels', duration: '1 day', materials: ['Concrete'] },
      { step: 2, title: 'Frame Assembly', description: 'Build wooden frame structure', duration: '2 days', materials: ['Wood'] },
      { step: 3, title: 'Roofing', description: 'Install metal roofing', duration: '1 day', materials: ['Metal'] },
      { step: 4, title: 'Door Installation', description: 'Install main door', duration: '0.5 days', materials: ['Wood'] }
    ],
    'greenhouse': [
      { step: 1, title: 'Foundation', description: 'Prepare foundation with steel beams', duration: '1 day', materials: ['Steel'] },
      { step: 2, title: 'Frame Construction', description: 'Build steel frame structure', duration: '2 days', materials: ['Steel'] },
      { step: 3, title: 'Glazing', description: 'Install glass panels', duration: '3 days', materials: ['Glass'] },
      { step: 4, title: 'Roofing', description: 'Install roofing panels', duration: '1 day', materials: ['Metal'] }
    ]
  };
  
  const steps = baseSteps[template.id] || baseSteps['garden-shed'];
  
  // Filter steps based on available materials
  return steps.filter(step => 
    step.materials.some(material => materialUsage[material]?.needed > 0)
  );
}

// Generate 3D model data (simplified)
function generate3DModelData(template, materialUsage, userConfig) {
  // Use user config for material properties if provided
  const materialProperties = userConfig?.materials?.reduce((acc, material) => {
    acc[material.name] = {
      color: material.color,
      texture: material.texture
    };
    return acc;
  }, {}) || {};
  
  return {
    modelType: template.id,
    dimensions: {
      width: template.size.includes('400') ? 20 : template.size.includes('200') ? 14 : 10,
      height: 8,
      depth: template.size.includes('400') ? 20 : template.size.includes('200') ? 14 : 8
    },
    materials: Object.entries(materialUsage).map(([material, usage]) => ({
      type: material,
      quantity: usage.needed,
      color: materialProperties[material]?.color || getMaterialColor(material),
      texture: materialProperties[material]?.texture || getMaterialTexture(material)
    })),
    downloadUrl: `/api/construction/model/${template.id}`,
    viewUrl: `/construction-viewer/${template.id}`
  };
}

function getMaterialColor(material) {
  const colors = {
    'Steel': '#8B8C89',
    'Wood': '#8B4513',
    'Glass': '#87CEEB',
    'Metal': '#708090',
    'Ceramic': '#F5F5DC',
    'Concrete': '#808080'
  };
  return colors[material] || '#CCCCCC';
}

function getMaterialTexture(material) {
  const textures = {
    'Steel': 'metallic',
    'Wood': 'wood-grain',
    'Glass': 'transparent',
    'Metal': 'brushed-metal',
    'Ceramic': 'smooth',
    'Concrete': 'rough'
  };
  return textures[material] || 'solid';
}

export default router;
