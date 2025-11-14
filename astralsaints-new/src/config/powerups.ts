// Power-up configuration
export type PowerUpType = 'damage' | 'speed' | 'shield' | 'firerate' | 'weapon';

export interface PowerUpConfig {
  id: PowerUpType;
  name: string;
  description: string;
  duration: number; // milliseconds, 0 = permanent until used
  effect: {
    type: 'stat_boost' | 'temp_armor' | 'weapon_change';
    stat?: string;
    multiplier?: number;
    value?: number;
  };
  color: number; // Visual color
  rarity: number; // 1-5, affects drop chance
}

export const POWERUP_TYPES: Record<PowerUpType, PowerUpConfig> = {
  damage: {
    id: 'damage',
    name: 'Damage Boost',
    description: '+50% weapon damage',
    duration: 15000, // 15 seconds
    effect: {
      type: 'stat_boost',
      stat: 'damage',
      multiplier: 1.5
    },
    color: 0xff3333,
    rarity: 2
  },

  speed: {
    id: 'speed',
    name: 'Speed Boost',
    description: '+40% movement speed',
    duration: 15000,
    effect: {
      type: 'stat_boost',
      stat: 'speed',
      multiplier: 1.4
    },
    color: 0x00ff00,
    rarity: 2
  },

  shield: {
    id: 'shield',
    name: 'Shield',
    description: '+50 temporary armor',
    duration: 0, // Until armor is depleted
    effect: {
      type: 'temp_armor',
      value: 50
    },
    color: 0x00aaff,
    rarity: 3
  },

  firerate: {
    id: 'firerate',
    name: 'Fire Rate',
    description: '2x fire rate',
    duration: 10000, // 10 seconds
    effect: {
      type: 'stat_boost',
      stat: 'fireRate',
      multiplier: 0.5 // Lower = faster (it's a delay)
    },
    color: 0xffaa00,
    rarity: 2
  },

  weapon: {
    id: 'weapon',
    name: 'Weapon Change',
    description: 'Changes your weapon type',
    duration: 20000, // 20 seconds, then revert to normal
    effect: {
      type: 'weapon_change'
    },
    color: 0xff00ff,
    rarity: 3
  }
};

// Drop chances (must sum to ~100)
export const DROP_CHANCES: Record<PowerUpType | 'none', number> = {
  none: 70, // 70% chance of no drop
  damage: 8,
  speed: 8,
  shield: 6,
  firerate: 6,
  weapon: 2 // Rarest
};
