// Enemy type configuration
export interface EnemyConfig {
  id: string;
  name: string;
  health: number;
  speed: number;
  scoreValue: number;
  size: { width: number; height: number };
  color: number; // Hex color for now, will be replaced with sprites
  fireRate?: number; // milliseconds, undefined = doesn't shoot
  bulletSpeed?: number;
  bulletDamage?: number;
}

export const ENEMY_TYPES: Record<string, EnemyConfig> = {
  scout: {
    id: 'scout',
    name: 'Scout',
    health: 20,
    speed: 150,
    scoreValue: 100,
    size: { width: 30, height: 30 },
    color: 0xff3333,
    fireRate: 2500,
    bulletSpeed: 250,
    bulletDamage: 10
  },
  fighter: {
    id: 'fighter',
    name: 'Fighter',
    health: 40,
    speed: 120,
    scoreValue: 200,
    size: { width: 35, height: 35 },
    color: 0xff6633,
    fireRate: 2000,
    bulletSpeed: 280,
    bulletDamage: 15
  },
  heavy: {
    id: 'heavy',
    name: 'Heavy',
    health: 80,
    speed: 80,
    scoreValue: 400,
    size: { width: 45, height: 45 },
    color: 0xff0033,
    fireRate: 3000,
    bulletSpeed: 220,
    bulletDamage: 25
  },
  drone: {
    id: 'drone',
    name: 'Drone',
    health: 15,
    speed: 180,
    scoreValue: 50,
    size: { width: 25, height: 25 },
    color: 0xffaa33,
    // Drones don't shoot, they just swarm
  },
  interceptor: {
    id: 'interceptor',
    name: 'Interceptor',
    health: 30,
    speed: 200,
    scoreValue: 150,
    size: { width: 28, height: 28 },
    color: 0xff9933,
    fireRate: 1800,
    bulletSpeed: 320,
    bulletDamage: 12
  }
};
