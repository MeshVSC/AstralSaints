// Weapon types configuration
export type WeaponType = 'normal' | 'spread' | 'laser' | 'wave' | 'rapid';

export interface WeaponConfig {
  id: WeaponType;
  name: string;
  description: string;
  fireRate: number; // Multiplier to base fire rate (1.0 = normal)
  damage: number; // Multiplier to base damage
  bulletSpeed: number; // Multiplier to base bullet speed
  pattern: 'single' | 'triple' | 'beam' | 'wave' | 'burst';
  bulletCount?: number; // For multi-shot weapons
  spread?: number; // Angle spread for multi-shot (degrees)
  color: number; // Bullet color
}

export const WEAPON_TYPES: Record<WeaponType, WeaponConfig> = {
  normal: {
    id: 'normal',
    name: 'Standard Blaster',
    description: 'Balanced weapon with steady fire',
    fireRate: 1.0,
    damage: 1.0,
    bulletSpeed: 1.0,
    pattern: 'single',
    color: 0x00ffff
  },

  spread: {
    id: 'spread',
    name: 'Spread Shot',
    description: 'Fires 3 bullets in a cone pattern',
    fireRate: 1.2, // Slightly slower
    damage: 0.7, // Lower damage per bullet
    bulletSpeed: 0.9,
    pattern: 'triple',
    bulletCount: 3,
    spread: 25, // 25 degrees spread
    color: 0xff9900
  },

  laser: {
    id: 'laser',
    name: 'Laser Beam',
    description: 'Fast, thin, piercing shots',
    fireRate: 0.7, // Much faster
    damage: 0.8,
    bulletSpeed: 1.5, // Very fast
    pattern: 'single',
    color: 0xff0066
  },

  wave: {
    id: 'wave',
    name: 'Wave Cannon',
    description: 'Bullets move in sine wave pattern',
    fireRate: 1.1,
    damage: 1.2,
    bulletSpeed: 0.8,
    pattern: 'wave',
    color: 0x00ff99
  },

  rapid: {
    id: 'rapid',
    name: 'Rapid Fire',
    description: 'Very fast fire rate, lower damage',
    fireRate: 0.5, // Very fast
    damage: 0.6, // Low damage
    bulletSpeed: 1.1,
    pattern: 'single',
    color: 0xffff00
  }
};
