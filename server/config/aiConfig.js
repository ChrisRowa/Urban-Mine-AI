/**
 * AI Configuration for preventing hallucinations and ensuring accuracy
 */

export const aiConfig = {
  // Model settings for factual responses
  model: {
    name: 'llama3-8b-8192',
    temperature: 0.1, // Low temperature for more deterministic responses
    maxTokens: 800, // Limit response length to reduce hallucinations
    topP: 0.9 // Allow some flexibility but maintain accuracy
  },

  // Prompt constraints
  promptConstraints: {
    // Only use information from provided component data
    strictDataUsage: true,
    
    // Prohibit invented information
    noInventedTools: true,
    noInventedProcedures: true,
    noUnrealisticEstimates: true,
    
    // Safety requirements
    requireSafetyDisclaimers: true,
    requireConsultationWarnings: true,
    
    // Construction standards
    enforceIndustryStandards: true,
    maxTimePerComponent: 8, // Maximum hours per component
    minTimePerComponent: 0.5 // Minimum hours per component
  },

  // Validation rules
  validation: {
    // Required safety equipment
    requiredSafetyEquipment: [
      'hard hat', 'safety glasses', 'gloves', 'steel-toed boots'
    ],
    
    // Standard tools only (no specialized brands)
    allowedToolCategories: [
      'hand tools', 'power tools', 'cutting tools', 
      'lifting equipment', 'safety equipment'
    ],
    
    // Prohibited dangerous instructions
    prohibitedInstructions: [
      'explosives', 'dynamite', 'blasting',
      'cutting load bearing without support',
      'welding in confined spaces without ventilation',
      'electrical work without lockout/tagout'
    ],
    
    // Required warnings
    requiredWarnings: [
      'structural engineer consultation',
      'local regulations compliance',
      'OSHA guidelines reference',
      'professional certification requirements'
    ]
  },

  // Fallback behavior when AI is unavailable or fails validation
  fallback: {
    useDataDrivenPlan: true,
    confidenceThreshold: 0.7, // Use fallback if AI confidence below this
    maxRetries: 2
  },

  // Logging and monitoring
  monitoring: {
    logAIResponses: true,
    logValidationResults: true,
    trackFallbackUsage: true
  }
};

/**
 * Get AI configuration with environment overrides
 */
export function getAIConfig() {
  return {
    ...aiConfig,
    // Environment-specific overrides
    temperature: process.env.AI_TEMPERATURE ? 
      parseFloat(process.env.AI_TEMPERATURE) : aiConfig.model.temperature,
    maxTokens: process.env.AI_MAX_TOKENS ? 
      parseInt(process.env.AI_MAX_TOKENS) : aiConfig.model.maxTokens
  };
}
