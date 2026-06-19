/**
 * Validation Service to ensure AI responses are factual and safe
 */

/**
 * Validate deconstruction plan for safety and accuracy
 */
export function validateDeconstructionPlan(plan, components) {
  const issues = [];
  const warnings = [];

  // Check if all components are addressed
  if (plan.steps && Array.isArray(plan.steps)) {
    const addressedComponents = new Set();
    plan.steps.forEach(step => {
      if (step.components && Array.isArray(step.components)) {
        step.components.forEach(comp => addressedComponents.add(comp));
      }
    });

    const originalComponents = new Set(components.map(c => c.name));
    const missingComponents = [...originalComponents].filter(comp => !addressedComponents.has(comp));
    
    if (missingComponents.length > 0) {
      warnings.push(`Components not addressed: ${missingComponents.join(', ')}`);
    }
  }

  // Validate time estimates
  if (plan.steps) {
    plan.steps.forEach((step, index) => {
      if (step.time) {
        const timeMatch = step.time.match(/(\d+)/);
        if (timeMatch) {
          const hours = parseInt(timeMatch[1]);
          if (hours > 12) {
            issues.push(`Step ${index + 1}: Unrealistic time estimate (${hours} hours)`);
          }
          if (hours < 0.5) {
            issues.push(`Step ${index + 1}: Unrealistically short time estimate (${hours} hours)`);
          }
        }
      }
    });
  }

  // Validate safety requirements
  const requiredSafety = ['Personal Protective Equipment'];
  if (plan.steps) {
    plan.steps.forEach((step, index) => {
      if (step.safety && Array.isArray(step.safety)) {
        if (!step.safety.some(safety => safety.toLowerCase().includes('helmet') || safety.toLowerCase().includes('hat'))) {
          warnings.push(`Step ${index + 1}: Missing head protection requirement`);
        }
      }
    });
  }

  // Check for hazardous materials handling
  components.forEach(component => {
    if (component.material && component.material.toLowerCase().includes('asbestos')) {
      issues.push('Asbestos detected - requires specialized abatement procedures');
    }
    if (component.material && component.material.toLowerCase().includes('lead')) {
      issues.push('Lead-based materials detected - requires specialized handling');
    }
  });

  return {
    isValid: issues.length === 0,
    issues,
    warnings,
    confidence: issues.length === 0 ? 1.0 : 0.6
  };
}

/**
 * Sanitize AI response to remove harmful instructions
 */
export function sanitizeAIResponse(response) {
  let sanitized = response;

  // Remove dangerous tool suggestions
  const dangerousTools = [
    'dynamite', 'explosives', 'blasting', 'welding without ventilation',
    'cutting load-bearing columns without support'
  ];

  dangerousTools.forEach(tool => {
    const regex = new RegExp(tool, 'gi');
    sanitized = sanitized.replace(regex, '[REMOVED - DANGEROUS]');
  });

  // Add safety disclaimers
  if (!sanitized.includes('safety') || !sanitized.includes('protect')) {
    sanitized += '\n\nSAFETY NOTE: Always consult with structural engineers and follow local safety regulations.';
  }

  return sanitized;
}

/**
 * Check if instructions are construction industry standard
 */
export function validateConstructionStandards(instructions) {
  const standards = {
    timePerSquareFoot: 0.1, // hours per sq ft (conservative)
    maxComponentsPerStep: 10,
    requiredSafetyEquipment: ['hard hat', 'safety glasses', 'gloves']
  };

  const validation = {
    withinStandards: true,
    violations: []
  };

  // Check for unrealistic productivity claims
  if (instructions.includes('instant') || instructions.includes('minutes')) {
    validation.withinStandards = false;
    validation.violations.push('Unrealistic time estimates');
  }

  // Check for missing safety equipment
  standards.requiredSafetyEquipment.forEach(equipment => {
    if (!instructions.toLowerCase().includes(equipment)) {
      validation.violations.push(`Missing ${equipment} requirement`);
    }
  });

  return validation;
}
