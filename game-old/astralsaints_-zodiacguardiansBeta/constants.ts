import { FormLevel, EnemyType, ShipType, ShipWeaponType, Wave } from './types';
import { PegasusIcon, DragonIcon, CygnusIcon, AndromedaIcon, PhoenixIcon } from './components/icons';

export const GAME_WIDTH = 600;
export const GAME_HEIGHT = 1000;

// Player
export const PLAYER_START_POS = { x: GAME_WIDTH / 2 - 25, y: GAME_HEIGHT - 100 };
export const PLAYER_SIZE = { width: 50, height: 50 };
export const PLAYER_SPEED = 7;
export const PLAYER_HEALTH = 100;

// Player Weapon Upgrades
export const PLAYER_BASE_FIRE_RATE = 200; // ms between shots
export const PLAYER_FIRE_RATE_BONUS_PER_LEVEL = 15; // ms reduction per level
export const PLAYER_MAX_FIRE_RATE_LEVEL = 10;
export const PLAYER_BASE_DAMAGE = 10;
export const PLAYER_DAMAGE_PER_LEVEL = 3;
export const PLAYER_MAX_POWER_LEVEL = 10;

// Ship Data
export const SHIP_DATA = {
  [ShipType.Pegasus]: {
    Icon: PegasusIcon,
    color: 'text-cyan-300',
    shadow: 'hover:shadow-[0_0_35px_10px_#0891b2]',
    hue: 0,
    weaponType: ShipWeaponType.Spread,
    description: "Balanced fighter with a wide-angle spread shot. Reliable and versatile for any situation."
  },
  [ShipType.Dragon]: {
    Icon: DragonIcon,
    color: 'text-green-400',
    shadow: 'hover:shadow-[0_0_35px_10px_#16a34a]',
    hue: 80,
    weaponType: ShipWeaponType.TriBeam,
    description: "Heavy assault ship firing three powerful, parallel beams. High damage output in a focused area."
  },
  [ShipType.Cygnus]: {
    Icon: CygnusIcon,
    color: 'text-blue-200',
    shadow: 'hover:shadow-[0_0_35px_10px_#60a5fa]',
    hue: 20,
    weaponType: ShipWeaponType.Pulse,
    description: "Rapid-fire skirmisher. Unleashes a relentless stream of fast-moving plasma pulses."
  },
  [ShipType.Andromeda]: {
    Icon: AndromedaIcon,
    color: 'text-pink-400',
    shadow: 'hover:shadow-[0_0_35px_10px_#ec4899]',
    hue: 280,
    weaponType: ShipWeaponType.Wave,
    description: "Area-control vessel firing wide energy waves that pierce through multiple enemies."
  },
  [ShipType.Phoenix]: {
    Icon: PhoenixIcon,
    color: 'text-orange-400',
    shadow: 'hover:shadow-[0_0_35px_10px_#f97316]',
    hue: -140,
    weaponType: ShipWeaponType.Charge,
    description: "Glass cannon specializing in devastating charged shots. High risk, high reward."
  },
};

// Evolution
export const EVOLUTION_THRESHOLDS: Record<FormLevel, number> = {
  [FormLevel.I]: 0,
  [FormLevel.II]: 5000,
  [FormLevel.III]: 20000,
};

// Awakening
export const AWAKENING_COMBO_TRIGGER = 5;
export const AWAKENING_DURATION = 10000; // 10 seconds

// Projectiles
export const PLAYER_PROJECTILE_SPEED = 12;
export const ENEMY_PROJECTILE_SPEED = 6;
export const PROJECTILE_SIZE = { width: 8, height: 24 };

// Enemies (New Simplified System)
export const ENEMY_STATS: Record<EnemyType, { size: { width: number, height: number }, health: number, speed: number, points: number, fireRate?: number }> = {
  [EnemyType.Scout]: { size: { width: 50, height: 50 }, health: 30, speed: 3, points: 100 },
  [EnemyType.Striker]: { size: { width: 100, height: 100 }, health: 150, speed: 1.5, points: 500, fireRate: 2000 },
  [EnemyType.Bruiser]: { size: { width: 200, height: 200 }, health: 800, speed: 0.75, points: 2000 },
  [EnemyType.Boss]: { size: { width: 180, height: 160 }, health: 5000, speed: 1, points: 10000, fireRate: 800 },
};

// New Wave-based Spawning System
export const WAVE_CLEAR_COOLDOWN = 3000; // 3s between waves

export const WAVE_DEFINITIONS: Wave[] = [
    { name: "First Contact", enemies: [
        { type: EnemyType.Scout, x: 0.5, delay: 500 },
        { type: EnemyType.Scout, x: 0.3, delay: 1000 },
        { type: EnemyType.Scout, x: 0.7, delay: 1500 },
    ]},
    { name: "Pincer", enemies: [
        { type: EnemyType.Scout, x: 0.1, delay: 500 },
        { type: EnemyType.Scout, x: 0.9, delay: 500 },
        { type: EnemyType.Scout, x: 0.2, delay: 1200 },
        { type: EnemyType.Scout, x: 0.8, delay: 1200 },
        { type: EnemyType.Scout, x: 0.5, delay: 1800 },
    ]},
    { name: "Striker Introduction", enemies: [
        { type: EnemyType.Striker, x: 0.5, delay: 1000 },
        { type: EnemyType.Scout, x: 0.2, delay: 2000 },
        { type: EnemyType.Scout, x: 0.8, delay: 2000 },
    ]},
    { name: "Wall of Scouts", enemies: [
        { type: EnemyType.Scout, x: 0.1, delay: 500 },
        { type: EnemyType.Scout, x: 0.3, delay: 600 },
        { type: EnemyType.Scout, x: 0.5, delay: 700 },
        { type: EnemyType.Scout, x: 0.7, delay: 800 },
        { type: EnemyType.Scout, x: 0.9, delay: 900 },
    ]},
    { name: "Bruiser!" , enemies: [
        { type: EnemyType.Bruiser, x: 0.5, delay: 1000 },
        { type: EnemyType.Scout, x: 0.1, delay: 2000 },
        { type: EnemyType.Scout, x: 0.9, delay: 2000 },
    ]},
    { name: "Combined Arms", enemies: [
        { type: EnemyType.Striker, x: 0.2, delay: 500 },
        { type: EnemyType.Striker, x: 0.8, delay: 500 },
        { type: EnemyType.Scout, x: 0.4, delay: 1500 },
        { type: EnemyType.Scout, x: 0.5, delay: 1600 },
        { type: EnemyType.Scout, x: 0.6, delay: 1700 },
    ]},
    { name: "The Swarm", enemies: [
        { type: EnemyType.Scout, x: Math.random(), delay: 500 },
        { type: EnemyType.Scout, x: Math.random(), delay: 700 },
        { type: EnemyType.Scout, x: Math.random(), delay: 900 },
        { type: EnemyType.Scout, x: Math.random(), delay: 1100 },
        { type: EnemyType.Scout, x: Math.random(), delay: 1300 },
        { type: EnemyType.Scout, x: Math.random(), delay: 1500 },
        { type: EnemyType.Striker, x: 0.5, delay: 2000 },
    ]},
];


// Boss
export const BOSS_SPAWN_SCORE = 25000;
export const BOSS_HEALTH_INCREASE_FACTOR = 1.5;
export const BOSS_HORIZONTAL_SPEED = 2;

// Combo
export const COMBO_TIMEOUT = 2000; // ms to keep combo active

// Special Weapon
export const SPECIAL_WEAPON_COOLDOWN = 15000; // 15 seconds

// Power-ups
export const POWERUP_SIZE = { width: 40, height: 40 };
export const POWERUP_SPEED = 2.5;
export const POWERUP_DROP_CHANCE = 0.15; // 15% chance to drop from a normal enemy