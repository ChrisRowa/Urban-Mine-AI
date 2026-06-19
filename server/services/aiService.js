import axios from 'axios';

/**
 * Generate AI-powered deconstruction plan using Groq API
 */
export async function generateDeconstructionPlan(components) {
  try {
    // If no API key is configured, return a mock plan
    if (!process.env.GROQ_API_KEY) {
      return generateMockDeconstructionPlan(components);
    }
    
    // Prepare the prompt for AI
    const prompt = createDeconstructionPrompt(components);
    
    // Call Groq API
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama3-8b-8192',
        messages: [
          {
            role: 'system',
            content: 'You are an expert in circular construction and building deconstruction. Generate detailed, step-by-step deconstruction plans that maximize material reuse and minimize waste.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.3
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    const aiResponse = response.data.choices[0].message.content;
    return parseAIResponse(aiResponse, components);
    
  } catch (error) {
    console.error('AI service error:', error);
    // Fallback to mock plan
    return generateMockDeconstructionPlan(components);
  }
}

/**
 * Create the prompt for the AI
 */
function createDeconstructionPrompt(components) {
  const reusableComponents = components.filter(c => c.category === 'Reusable');
  const recyclableComponents = components.filter(c => c.category === 'Recyclable');
  const wasteComponents = components.filter(c => c.category === 'Waste');
  
  return `
Generate a detailed, step-by-step deconstruction plan strictly for the following building components ONLY. Do not assume or invent any other materials or structural elements that are not explicitly listed in the summaries below.

REUSABLE COMPONENTS (${reusableComponents.length}):
${reusableComponents.map(c => `- ${c.name} (${c.material}) - ${c.quantity} units at ${c.location}`).join('\n')}

RECYCLABLE COMPONENTS (${recyclableComponents.length}):
${recyclableComponents.map(c => `- ${c.name} (${c.material}) - ${c.quantity} units at ${c.location}`).join('\n')}

WASTE COMPONENTS (${wasteComponents.length}):
${wasteComponents.map(c => `- ${c.name} (${c.material}) - ${c.quantity} units at ${c.location}`).join('\n')}

Please provide precisely:
1. Chronological deconstruction instructions (Safe removal order)
2. Tool and equipment requirements for these specific items
3. Safety protocols for handled materials
4. Logistics for destination (Reuse/Recycle/Waste)

Strict requirement: If a material is not in the list above, do not mention it in the plan. Format as a professional, actionable construction directive.
`;
}

/**
 * Parse AI response into structured format
 */
function parseAIResponse(aiResponse, components) {
  const summary = calculateSummary(components);
  
  return {
    plan: aiResponse,
    summary,
    reuseOpportunities: generateReuseOpportunities(components)
  };
}

/**
 * Generate mock deconstruction plan (fallback)
 */
function generateMockDeconstructionPlan(components) {
  const summary = calculateSummary(components);
  
  const plan = `
# UrbanMine AI Deconstruction Plan

## Phase 1: Preparation (Days 1-2)
- Conduct site safety assessment
- Install protective barriers
- Prepare material sorting areas
- Gather required tools and equipment

## Phase 2: Top-Down Deconstruction (Days 3-10)

### Step 1: Roof Components Removal
- Carefully remove roofing sheets from roof area
- Sort metal roofing for recycling
- Transport to designated storage area

### Step 2: Upper Floor Components
- Remove window panels from Floor 2
- Detach aluminum frames for reuse
- Remove interior plasterboard panels
- Sort electrical conduits for recycling

### Step 3: Ground Floor Components
- Remove wooden doors and frames
- Carefully extract floor tiles where possible
- Remove steel beams from foundation

### Step 4: Foundation Elements
- Remove concrete wall panels (last resort)
- Process concrete for recycling where possible

## Phase 3: Material Processing (Days 11-12)
- Clean and inspect reusable materials
- Package materials for transport
- Load materials for delivery to reuse projects

## Safety Considerations
- Use appropriate PPE at all times
- Follow OSHA regulations for demolition
- Ensure structural stability during removal
- Use proper lifting techniques

## Environmental Impact
- Estimated CO2 savings: ${summary.co2Savings} kg
- Landfill waste avoided: ${summary.waste} components
- Material value recovered: $${summary.salvageValue}
`;

  return {
    plan,
    summary,
    reuseOpportunities: generateReuseOpportunities(components)
  };
}

/**
 * Generate reuse opportunities
 */
function generateReuseOpportunities(components) {
  const opportunities = [];
  
  const opportunitiesMap = {
    'Steel': 'Steel beams can be reused in warehouse construction or as structural support in new buildings',
    'Aluminum': 'Aluminum window frames and panels are perfect for school renovation projects',
    'Wood': 'Wooden doors can be refinished and used in affordable housing projects',
    'Glass': 'Glass panels can be reused in greenhouse construction or artistic installations',
    'Metal': 'Metal roofing sheets are ideal for agricultural buildings and storage facilities'
  };

  components.forEach(component => {
    if (component.category === 'Reusable') {
      const primaryMaterial = component.material.split('+')[0].trim();
      
      if (opportunitiesMap[primaryMaterial]) {
        opportunities.push({
          component: component.name,
          material: primaryMaterial,
          quantity: component.quantity,
          opportunity: opportunitiesMap[primaryMaterial]
        });
      }
    }
  });
  
  return opportunities;
}

/**
 * Calculate summary statistics
 */
function calculateSummary(components) {
  const total = components.length;
  const reusable = components.filter(c => c.category === 'Reusable').length;
  const recyclable = components.filter(c => c.category === 'Recyclable').length;
  const waste = components.filter(c => c.category === 'Waste').length;
  
  return {
    total,
    reusable,
    recyclable,
    waste
  };
}
