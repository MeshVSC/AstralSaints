// Level configuration - defines waves for each level

export interface LevelConfig {
  id: number;
  name: string;
  description: string;
  waves: string[]; // Array of wave pattern IDs from wavePatterns.ts
  difficultyMultiplier: number; // Multiplies enemy health/damage
  background?: string; // Background theme/color
  isBossLevel: boolean;
  bossId?: string; // Boss identifier (for future implementation)
}

export const LEVELS: LevelConfig[] = [
  {
    id: 1,
    name: 'First Contact',
    description: 'Your first encounter with enemy forces',
    waves: [
      'basic_pincer',
      'basic_pincer',
      'drone_swarm',
      'v_attack'
    ],
    difficultyMultiplier: 1.0,
    background: '#000033',
    isBossLevel: false
  },
  {
    id: 2,
    name: 'Rising Threat',
    description: 'The enemy adapts to your tactics',
    waves: [
      'v_attack',
      'drone_swarm',
      'interceptor_rush',
      'mixed_assault',
      'heavy_circle'
    ],
    difficultyMultiplier: 1.2,
    background: '#000044',
    isBossLevel: false
  },
  {
    id: 3,
    name: 'Coordinated Strike',
    description: 'More complex formations and tactics',
    waves: [
      'mixed_assault',
      'interceptor_rush',
      'heavy_circle',
      'v_attack',
      'drone_swarm',
      'basic_pincer'
    ],
    difficultyMultiplier: 1.4,
    background: '#000055',
    isBossLevel: false
  },
  {
    id: 4,
    name: 'The Gauntlet',
    description: 'Face wave after wave of enemies',
    waves: [
      'interceptor_rush',
      'heavy_circle',
      'drone_swarm',
      'mixed_assault',
      'v_attack',
      'interceptor_rush',
      'heavy_circle'
    ],
    difficultyMultiplier: 1.6,
    background: '#001155',
    isBossLevel: false
  },
  {
    id: 5,
    name: 'Constellation Guardian',
    description: 'The first true test - face Aries, the Ram of Light',
    waves: [
      'mixed_assault',
      'interceptor_rush',
      'heavy_circle',
      'drone_swarm'
    ],
    difficultyMultiplier: 1.8,
    background: '#002266',
    isBossLevel: true,
    bossId: 'aries'
  }
];

// Helper to get level by id
export function getLevel(id: number): LevelConfig | undefined {
  return LEVELS.find(level => level.id === id);
}

// Get total number of levels
export function getTotalLevels(): number {
  return LEVELS.length;
}
