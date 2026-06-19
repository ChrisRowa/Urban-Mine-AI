// Reusability Scoring Engine for UrbanMine AI

/**
 * Calculate reuse score for a building component
 * Score ranges from 0-100
 * 75+ → Reusable
 * 45–74 → Recyclable  
 * Below 45 → Waste
 */
export function calculateReuseScore(component) {
  let score = 50; // Base score
  
  // Material scoring
  const materialScores = {
    'Steel': 20,
    'Aluminum': 18,
    'Wood': 15,
    'Glass': 12,
    'Metal': 15,
    'Gypsum': 5,
    'PVC': 3,
    'Ceramic': 8,
    'Concrete': 2
  };
  
  // Extract primary material (handle composite materials)
  const primaryMaterial = component.material.split('+')[0].trim();
  score += materialScores[primaryMaterial] || 0;
  
  // Connection type scoring
  const connectionScores = {
    'Bolted': 15,
    'Screwed': 12,
    'Clipped': 10,
    'Welded': 5,
    'Glued': -10,
    'Adhesive': -15
  };
  
  score += connectionScores[component.connectionType] || 0;
  
  // Condition scoring
  const conditionScores = {
    'Good': 15,
    'Fair': 5,
    'Poor': -10
  };
  
  score += conditionScores[component.condition] || 0;
  
  // Age deduction (older components lose score)
  const ageDeduction = Math.min((component.estimatedAge || 0) * 0.5, 15);
  score -= ageDeduction;
  
  // Ensure score stays within bounds
  score = Math.max(0, Math.min(100, score));
  
  return Math.round(score);
}

/**
 * Determine category based on reuse score
 */
export function getCategory(score) {
  if (score >= 75) return 'Reusable';
  if (score >= 45) return 'Recyclable';
  return 'Waste';
}

/**
 * Generate reason for the score
 */
export function generateReason(component, score) {
  const reasons = [];
  
  // Material reasons
  const primaryMaterial = component.material.split('+')[0].trim();
  if (['Steel', 'Aluminum', 'Wood'].includes(primaryMaterial)) {
    reasons.push(`${primaryMaterial} is highly reusable`);
  }
  
  // Connection reasons
  if (component.connectionType === 'Bolted') {
    reasons.push('Bolted connection allows easy removal');
  } else if (component.connectionType === 'Glued' || component.connectionType === 'Adhesive') {
    reasons.push('Adhesive connection makes removal difficult');
  }
  
  // Condition reasons
  if (component.condition === 'Good') {
    reasons.push('Good condition preserves value');
  } else if (component.condition === 'Poor') {
    reasons.push('Poor condition limits reuse potential');
  }
  
  // Age reasons
  if (component.estimatedAge < 10) {
    reasons.push('Relatively new component');
  } else if (component.estimatedAge > 20) {
    reasons.push('Age may affect structural integrity');
  }
  
  return reasons.join('. ');
}

/**
 * Process multiple components and add scores
 */
export function processComponents(components) {
  return components.map(component => {
    const reuseScore = calculateReuseScore(component);
    const category = getCategory(reuseScore);
    const reason = generateReason(component, reuseScore);
    
    return {
      ...component,
      reuseScore,
      category,
      reason
    };
  });
}
