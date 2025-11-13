// Evolution system - ships have 3 evolution stages
// Data structure only - implementation comes later

export interface EvolutionStage {
  stage: number; // 1, 2, or 3
  name: string;
  description: string;
  requirements: {
    level?: number; // player must reach this level
    kills?: number; // total kills required
    score?: number; // total score required
  };
  statBoosts: {
    healthMultiplier: number; // e.g., 1.2 = +20% health
    armorMultiplier: number;
    speedMultiplier: number;
    fireRateMultiplier: number; // Lower = faster (e.g., 0.9 = 10% faster)
    damageMultiplier: number;
  };
  visualChanges: {
    assetSuffix: string; // e.g., '_evo1', '_evo2', '_evo3'
    glowColor?: number; // Hex color for evolution glow effect
    particleEffect?: string; // Particle effect name
  };
}

export interface ShipEvolution {
  shipId: string;
  stages: EvolutionStage[];
  hiddenSpecialForm?: {
    // Hidden special form unlocks from stage 2+
    // Full implementation later
    unlocksAtStage: number;
    name: string;
    description: string;
    triggerConditions: string[]; // Descriptive for now
  };
}

// Evolution paths for each ship
export const SHIP_EVOLUTIONS: Record<string, ShipEvolution> = {
  pegasus: {
    shipId: 'pegasus',
    stages: [
      {
        stage: 1,
        name: 'Pegasus - Awakened',
        description: 'Wings of starlight manifest',
        requirements: {
          level: 3,
          kills: 100
        },
        statBoosts: {
          healthMultiplier: 1.15,
          armorMultiplier: 1.15,
          speedMultiplier: 1.1,
          fireRateMultiplier: 0.95,
          damageMultiplier: 1.1
        },
        visualChanges: {
          assetSuffix: '_evo1',
          glowColor: 0x00aaff
        }
      },
      {
        stage: 2,
        name: 'Pegasus - Ascended',
        description: 'Celestial power flows through you',
        requirements: {
          level: 8,
          kills: 500
        },
        statBoosts: {
          healthMultiplier: 1.3,
          armorMultiplier: 1.25,
          speedMultiplier: 1.2,
          fireRateMultiplier: 0.9,
          damageMultiplier: 1.25
        },
        visualChanges: {
          assetSuffix: '_evo2',
          glowColor: 0x00ddff
        }
      },
      {
        stage: 3,
        name: 'Pegasus - Divine',
        description: 'Become the constellation itself',
        requirements: {
          level: 15,
          kills: 1500
        },
        statBoosts: {
          healthMultiplier: 1.5,
          armorMultiplier: 1.4,
          speedMultiplier: 1.35,
          fireRateMultiplier: 0.85,
          damageMultiplier: 1.4
        },
        visualChanges: {
          assetSuffix: '_evo3',
          glowColor: 0x00ffff,
          particleEffect: 'divine_aura'
        }
      }
    ],
    hiddenSpecialForm: {
      unlocksAtStage: 2,
      name: 'Constellation Form',
      description: 'Transform into pure celestial energy',
      triggerConditions: ['Perfect combo', 'No damage taken', 'Special meter full']
    }
  },
  // Other ships follow similar pattern
  dragon: {
    shipId: 'dragon',
    stages: [
      {
        stage: 1,
        name: 'Dragon - Enkindled',
        description: 'Ancient flames awaken',
        requirements: { level: 3, kills: 100 },
        statBoosts: {
          healthMultiplier: 1.2,
          armorMultiplier: 1.2,
          speedMultiplier: 1.05,
          fireRateMultiplier: 0.95,
          damageMultiplier: 1.15
        },
        visualChanges: { assetSuffix: '_evo1', glowColor: 0xff3300 }
      },
      {
        stage: 2,
        name: 'Dragon - Infernal',
        description: 'Cosmic fire consumes all',
        requirements: { level: 8, kills: 500 },
        statBoosts: {
          healthMultiplier: 1.4,
          armorMultiplier: 1.35,
          speedMultiplier: 1.1,
          fireRateMultiplier: 0.9,
          damageMultiplier: 1.35
        },
        visualChanges: { assetSuffix: '_evo2', glowColor: 0xff6600 }
      },
      {
        stage: 3,
        name: 'Dragon - Supernova',
        description: 'Become a living star',
        requirements: { level: 15, kills: 1500 },
        statBoosts: {
          healthMultiplier: 1.6,
          armorMultiplier: 1.5,
          speedMultiplier: 1.2,
          fireRateMultiplier: 0.85,
          damageMultiplier: 1.6
        },
        visualChanges: { assetSuffix: '_evo3', glowColor: 0xff9900, particleEffect: 'supernova_aura' }
      }
    ]
  }
  // phoenix, andromeda, cygnus follow similar patterns
};

// Helper to get evolution stage for a ship
export function getEvolutionStage(shipId: string, stage: number): EvolutionStage | undefined {
  const evolution = SHIP_EVOLUTIONS[shipId];
  if (!evolution) return undefined;
  return evolution.stages.find(s => s.stage === stage);
}
