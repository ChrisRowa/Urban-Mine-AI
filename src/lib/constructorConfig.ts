// Dynamic constructor configuration system
export interface MaterialProperty {
  name: string;
  baseValue: number;
  co2Factor: number;
  reusabilityScore: number;
  recyclable: boolean;
  color?: string;
  texture?: string;
}

export interface ConnectionType {
  name: string;
  score: number;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export interface ConstructorTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  size: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  estimatedCost: number;
  co2Savings: number;
  baseRequirements: Record<string, { quantity: number; unit: string }>;
  materials: string[];
}

export interface UserConstructorConfig {
  materials: MaterialProperty[];
  connectionTypes: ConnectionType[];
  constructorTemplates: ConstructorTemplate[];
}

// Default configuration
export const defaultConfig: UserConstructorConfig = {
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
  ],
  constructorTemplates: [
    {
      id: 'tiny-house',
      name: 'Tiny House',
      description: 'Compact 400 sq ft living space',
      category: 'Residential',
      size: '400 sq ft',
      difficulty: 'Medium',
      estimatedCost: 15000,
      co2Savings: 8.5,
      materials: ['Steel', 'Wood', 'Glass', 'Metal', 'Ceramic'],
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
      category: 'Storage',
      size: '120 sq ft',
      difficulty: 'Easy',
      estimatedCost: 3000,
      co2Savings: 2.1,
      materials: ['Wood', 'Metal', 'Concrete'],
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
      category: 'Agricultural',
      size: '200 sq ft',
      difficulty: 'Medium',
      estimatedCost: 8000,
      co2Savings: 4.2,
      materials: ['Steel', 'Glass', 'Metal'],
      baseRequirements: {
        'Steel': { quantity: 8, unit: 'beams' },
        'Glass': { quantity: 15, unit: 'panels' },
        'Metal': { quantity: 12, unit: 'sheets' }
      }
    }
  ]
};

// Configuration management functions
export const loadUserConfig = (): UserConstructorConfig => {
  try {
    const saved = localStorage.getItem('constructorConfig');
    if (saved) {
      const userConfig = JSON.parse(saved);
      // Merge with default to ensure all required fields exist
      return {
        materials: [...defaultConfig.materials, ...userConfig.materials],
        connectionTypes: [...defaultConfig.connectionTypes, ...userConfig.connectionTypes],
        constructorTemplates: [...defaultConfig.constructorTemplates, ...userConfig.constructorTemplates]
      };
    }
  } catch (error) {
    console.warn('Failed to load user config, using defaults:', error);
  }
  return defaultConfig;
};

export const saveUserConfig = (config: UserConstructorConfig): void => {
  try {
    localStorage.setItem('constructorConfig', JSON.stringify(config));
  } catch (error) {
    console.error('Failed to save user config:', error);
  }
};

export const addCustomMaterial = (material: MaterialProperty): UserConstructorConfig => {
  const config = loadUserConfig();
  const updatedConfig = {
    ...config,
    materials: [...config.materials, material]
  };
  saveUserConfig(updatedConfig);
  return updatedConfig;
};

export const addCustomConnectionType = (connectionType: ConnectionType): UserConstructorConfig => {
  const config = loadUserConfig();
  const updatedConfig = {
    ...config,
    connectionTypes: [...config.connectionTypes, connectionType]
  };
  saveUserConfig(updatedConfig);
  return updatedConfig;
};

export const addCustomTemplate = (template: ConstructorTemplate): UserConstructorConfig => {
  const config = loadUserConfig();
  const updatedConfig = {
    ...config,
    constructorTemplates: [...config.constructorTemplates, template]
  };
  saveUserConfig(updatedConfig);
  return updatedConfig;
};

export const resetToDefaults = (): void => {
  saveUserConfig(defaultConfig);
};
