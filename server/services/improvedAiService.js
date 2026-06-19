import axios from 'axios';
import { validateDeconstructionPlan, sanitizeAIResponse, validateConstructionStandards } from './validationService.js';
import { getAIConfig } from '../config/aiConfig.js';

/**
 * Improved AI Service with factual accuracy checks and anti-hallucination measures
 * Only provides information that can be verified from the input data
 */
export async function generateDeconstructionPlan(components) {
  const config = getAIConfig();
  
  try {
    // If no API key is configured, return a structured mock plan
    if (!process.env.GROQ_API_KEY) {
      return generateDataDrivenPlan(components);
    }
    
    // Prepare the prompt with strict constraints
    const prompt = createStructuredPrompt(components, config);
    
    // Call Groq API with conservative settings
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: config.model.name,
        messages: [
          {
            role: 'system',
            content: createSystemPrompt(config)
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: config.maxTokens,
        temperature: config.temperature,
        top_p: config.model.topP
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    const aiResponse = response.data.choices[0].message.content;
    
    // Sanitize AI response to remove harmful instructions
    const sanitizedResponse = sanitizeAIResponse(aiResponse);
    
    // Validate and sanitize AI response
    const validatedPlan = validateAIResponse(sanitizedResponse, components);
    
    // Additional validation for construction standards
    const standardsValidation = validateConstructionStandards(sanitizedResponse);
    if (!standardsValidation.withinStandards) {
      console.warn('AI response violates construction standards, using fallback');
      return generateDataDrivenPlan(components);
    }
    
    return {
      ...validatedPlan,
      standardsValidation,
      lastValidated: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('AI service error:', error);
    // Fallback to data-driven plan
    return generateDataDrivenPlan(components);
  }
}

/**
 * Create system prompt based on configuration
 */
function createSystemPrompt(config) {
  return `You are an expert construction deconstruction specialist. 

CRITICAL RULES:
1. Only use information provided in the component data
2. Do not invent tools, equipment, or procedures not mentioned
3. Provide conservative time estimates (${config.promptConstraints.minTimePerComponent}-${config.promptConstraints.maxTimePerComponent} hours per major component)
4. Base all recommendations on actual material properties and connection types
5. If uncertain, state "Consult structural engineer" rather than guessing
6. Safety recommendations must be standard OSHA guidelines only
7. ${config.promptConstraints.requireSafetyDisclaimers ? 'Include safety disclaimers and consultation warnings' : ''}

RESPONSE FORMAT:
Return valid JSON only with these exact keys: plan, steps, materialHandling, summary`;
}

/**
 * Create a structured prompt that prevents hallucinations
 */
function createStructuredPrompt(components, config) {
  const reusableComponents = components.filter(c => c.category === 'Reusable');
  const recyclableComponents = components.filter(c => c.category === 'Recyclable');
  const wasteComponents = components.filter(c => c.category === 'Waste');
  
  // Extract only factual information from components
  const componentFacts = components.map(c => ({
    name: c.name,
    material: c.material,
    connectionType: c.connectionType,
    condition: c.condition,
    quantity: c.quantity,
    location: c.location,
    dimensions: c.dimensions,
    estimatedAge: c.estimatedAge,
    reuseScore: c.reuseScore || 50
  }));

  return `
Analyze the following building components and create a deconstruction plan:

COMPONENT DATA:
${JSON.stringify(componentFacts, null, 2)}

CATEGORIES:
- Reusable: ${reusableComponents.length} components
- Recyclable: ${recyclableComponents.length} components  
- Waste: ${wasteComponents.length} components

REQUIREMENTS:
1. Create a step-by-step deconstruction plan
2. For each step, specify ONLY:
   - Component name(s) involved
   - Actual tools needed based on connection type
   - Conservative time estimate (${config.promptConstraints.minTimePerComponent}-${config.promptConstraints.maxTimePerComponent} hours per major component)
   - Standard safety precautions
3. Material handling based on actual category:
   - Reusable: Clean and package for transport
   - Recyclable: Sort by material type
   - Waste: Dispose according to local regulations
4. Do NOT invent:
   - Specific tool brands
   - Unrealistic time estimates
   - Procedures not standard in construction industry
   - Equipment not mentioned in component data
5. ${config.promptConstraints.requireConsultationWarnings ? 'If uncertain, state "Consult structural engineer" rather than guessing' : ''}

${config.promptConstraints.requireSafetyDisclaimers ? '6. Safety recommendations must be standard OSHA guidelines only' : ''}
{
  "plan": "Step-by-step instructions...",
  "steps": [
    {
      "step": 1,
      "title": "Step title",
      "description": "What to do",
      "components": ["Component names"],
      "tools": ["Tool names"],
      "time": "Time estimate",
      "safety": ["Safety notes"]
    }
  ],
  "materialHandling": "Instructions for each material type",
  "summary": "Brief project summary"
}
`;
}

/**
 * Validate AI response against known data to prevent hallucinations
 */
function validateAIResponse(aiResponse, originalComponents) {
  try {
    // Try to parse as JSON first
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(aiResponse);
    } catch {
      // If not JSON, extract from text
      parsedResponse = extractJsonFromText(aiResponse);
    }

    // Validation checks
    const validation = {
      hasValidSteps: false,
      allComponentsAccounted: false,
      realisticTimeEstimates: false,
      noInventedTools: false
    };

    // Check if steps reference actual components
    if (parsedResponse.steps && Array.isArray(parsedResponse.steps)) {
      validation.hasValidSteps = true;
      
      // Check if components mentioned in steps exist in original data
      const mentionedComponents = new Set();
      parsedResponse.steps.forEach(step => {
        if (step.components && Array.isArray(step.components)) {
          step.components.forEach(comp => mentionedComponents.add(comp));
        }
      });
      
      const originalComponentNames = new Set(originalComponents.map(c => c.name));
      validation.allComponentsAccounted = [...mentionedComponents].every(comp => 
        originalComponentNames.has(comp)
      );
    }

    // Check for realistic time estimates
    if (parsedResponse.steps) {
      validation.realisticTimeEstimates = parsedResponse.steps.every(step => {
        if (step.time) {
          const timeMatch = step.time.match(/\d+/);
          return timeMatch && parseInt(timeMatch[0]) <= 8; // Max 8 hours per step
        }
        return true;
      });
    }

    // Check for standard tools only
    if (parsedResponse.steps) {
      const standardTools = [
        'wrench', 'socket set', 'screwdriver', 'hammer', 'pry bar', 
        'reciprocating saw', 'angle grinder', 'drill', 'bolt cutters',
        'forklift', 'crane', 'safety harness', 'hard hat', 'gloves'
      ];
      
      validation.noInventedTools = parsedResponse.steps.every(step => {
        if (step.tools && Array.isArray(step.tools)) {
          return step.tools.every(tool => 
            standardTools.some(standard => tool.toLowerCase().includes(standard))
          );
        }
        return true;
      });
    }

    // If validation fails, create a corrected plan
    if (!validation.hasValidSteps || !validation.allComponentsAccounted) {
      console.warn('AI response validation failed, using data-driven fallback');
      return generateDataDrivenPlan(originalComponents);
    }

    return {
      ...parsedResponse,
      validation,
      confidence: validation.hasValidSteps && validation.allComponentsAccounted ? 0.9 : 0.6
    };

  } catch (error) {
    console.error('Failed to validate AI response:', error);
    return generateDataDrivenPlan(originalComponents);
  }
}

/**
 * Extract JSON from AI text response
 */
function extractJsonFromText(text) {
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0]);
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * Generate a reliable data-driven deconstruction plan
 */
function generateDataDrivenPlan(components) {
  const reusableComponents = components.filter(c => c.category === 'Reusable');
  const recyclableComponents = components.filter(c => c.category === 'Recyclable');
  const wasteComponents = components.filter(c => c.category === 'Waste');
  
  // Group components by location for logical deconstruction order
  const componentsByLocation = components.reduce((acc, component) => {
    if (!acc[component.location]) acc[component.location] = [];
    acc[component.location].push(component);
    return acc;
  }, {});

  const steps = [];
  let stepNumber = 1;

  // Generate steps based on actual components and their properties
  Object.entries(componentsByLocation).forEach(([location, locationComponents]) => {
    locationComponents.forEach(component => {
      const tools = getToolsForConnection(component.connectionType);
      const time = getTimeEstimate(component);
      const safety = getSafetyRequirements(component);
      
      steps.push({
        step: stepNumber++,
        title: `Remove ${component.name} from ${location}`,
        description: `Carefully remove ${component.quantity} ${component.name}(s) from ${location} using appropriate tools. ${component.connectionType} connection requires ${getConnectionDescription(component.connectionType)}.`,
        components: [component.name],
        tools: tools,
        time: time,
        safety: safety
      });
    });
  });

  const plan = `
# UrbanMine AI Deconstruction Plan

## Overview
Deconstructing ${components.length} components across ${Object.keys(componentsByLocation).length} locations:
- Reusable: ${reusableComponents.length} components
- Recyclable: ${recyclableComponents.length} components
- Waste: ${wasteComponents.length} components

## Deconstruction Steps
${steps.map(step => `
### Step ${step.step}: ${step.title}
**Time Estimate:** ${step.time}
**Components:** ${step.components.join(', ')}
**Tools Required:** ${step.tools.join(', ')}
**Safety Requirements:** ${step.safety.join(', ')}
**Description:** ${step.description}
`).join('\n')}

## Material Handling Instructions

### Reusable Materials (${reusableComponents.length})
- Clean thoroughly to remove dirt and debris
- Inspect for damage during removal
- Package securely for transport
- Label with original location and quantity
- Store in protected area to prevent damage

### Recyclable Materials (${recyclableComponents.length})
- Sort by material type (steel, aluminum, wood, etc.)
- Remove non-recyclable attachments (screws, fasteners)
- Bundle or stack efficiently for transport
- Label with material type and quantity

### Waste Materials (${wasteComponents.length})
- Separate hazardous materials if present
- Follow local disposal regulations
- Transport to approved waste facility
- Document disposal for compliance records

## Safety Requirements
- Personal Protective Equipment (PPE): Hard hat, safety glasses, gloves, steel-toed boots
- Fall protection: Safety harness when working at height
- Dust control: Masks or respirators when cutting materials
- Equipment safety: Inspect tools before use, proper lockout/tagout

## Environmental Impact
- Materials recovered: ${reusableComponents.length + recyclableComponents.length} components
- Landfill diversion: Approximately ${Math.round((reusableComponents.length + recyclableComponents.length) / components.length * 100)}%
- CO2 savings: Estimated ${components.reduce((total, c) => {
    const co2Factors = { 'Steel': 1.8, 'Aluminum': 1.2, 'Wood': 0.3, 'Glass': 0.8, 'Metal': 1.5 };
    const material = c.material.split('+')[0].trim();
    return total + (co2Factors[material] || 0.5) * c.quantity;
  }, 0).toFixed(1)} kg CO2 equivalent

## Next Steps
1. Transport reusable materials to storage facility
2. Deliver recyclable materials to processing center
3. Dispose of waste materials according to local regulations
4. Document all materials recovered for reporting
`;

  return {
    plan,
    steps,
    materialHandling: `Follow material-specific handling instructions based on component categories`,
    summary: {
      totalComponents: components.length,
      reusable: reusableComponents.length,
      recyclable: recyclableComponents.length,
      waste: wasteComponents.length,
      estimatedTime: `${steps.length * 2}-${steps.length * 4} hours`,
      confidence: 1.0
    },
    reuseOpportunities: generateReuseOpportunities(reusableComponents)
  };
}

/**
 * Get appropriate tools based on connection type
 */
function getToolsForConnection(connectionType) {
  const toolMap = {
    'Bolted': ['Socket wrench set', 'Bolt cutters', 'Pry bar'],
    'Screwed': ['Screwdriver set', 'Power drill', 'Reciprocating saw'],
    'Welded': ['Angle grinder', 'Cutting torch', 'Chipping hammer'],
    'Glued': ['Heat gun', 'Putty knife', 'Scraper'],
    'Adhesive': ['Solvent applicator', 'Scraper', 'Putty knife'],
    'Nailed': ['Hammer', 'Nail puller', 'Pry bar'],
    'Clipped': ['Pliers', 'Flathead screwdriver', 'Release tool']
  };
  
  return toolMap[connectionType] || ['Basic hand tools'];
}

/**
 * Get time estimate based on component properties
 */
function getTimeEstimate(component) {
  const baseTime = {
    'Good': 2,
    'Fair': 3,
    'Poor': 4
  };
  
  const connectionMultiplier = {
    'Bolted': 1.0,
    'Screwed': 1.2,
    'Welded': 1.5,
    'Glued': 1.3,
    'Adhesive': 1.4
  };
  
  const base = baseTime[component.condition] || 3;
  const multiplier = connectionMultiplier[component.connectionType] || 1.0;
  const adjustedTime = Math.round(base * multiplier * Math.max(1, component.quantity / 5));
  
  return `${adjustedTime}-${Math.round(adjustedTime * 1.5)} hours`;
}

/**
 * Get safety requirements based on component
 */
function getSafetyRequirements(component) {
  const safety = ['Hard hat', 'Safety glasses', 'Gloves'];
  
  if (component.location.includes('Roof') || component.location.includes('Height')) {
    safety.push('Safety harness', 'Fall protection');
  }
  
  if (component.material.includes('Concrete') || component.material.includes('Metal')) {
    safety.push('Respirator', 'Dust mask');
  }
  
  if (component.connectionType === 'Welded') {
    safety.push('Face shield', 'Fire resistant clothing');
  }
  
  return safety;
}

/**
 * Generate reuse opportunities based on actual components
 */
function generateReuseOpportunities(reusableComponents) {
  return reusableComponents.map(component => {
    const primaryMaterial = component.material.split('+')[0].trim();
    
    const opportunities = {
      'Steel': 'Ideal for structural support in new construction, warehouse racking, or agricultural buildings',
      'Aluminum': 'Perfect for window frames, decorative panels, or lightweight structures',
      'Wood': 'Suitable for furniture making, interior design, or architectural elements',
      'Glass': 'Excellent for greenhouse construction, decorative features, or art installations',
      'Metal': 'Good for roofing, siding, or industrial applications'
    };
    
    return {
      component: component.name,
      material: primaryMaterial,
      quantity: component.quantity,
      opportunity: opportunities[primaryMaterial] || 'General construction reuse possible',
      estimatedValue: component.reuseScore ? component.reuseScore * 10 : 500,
      condition: component.condition
    };
  });
}
