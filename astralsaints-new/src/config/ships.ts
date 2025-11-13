// Ship configuration for the 5 starter ships
export interface ShipConfig {
  id: string;
  name: string;
  description: string;
  // Base stats
  maxHealth: number;
  maxArmor: number;
  speed: number;
  fireRate: number; // milliseconds between shots
  bulletSpeed: number;
  bulletDamage: number;
  // Asset
  assetKey: string;
  // Visual
  size: { width: number; height: number };
}

export const SHIPS: Record<string, ShipConfig> = {
  pegasus: {
    id: 'pegasus',
    name: 'Pegasus',
    description: 'Swift and agile, balanced stats',
    maxHealth: 100,
    maxArmor: 50,
    speed: 400,
    fireRate: 180,
    bulletSpeed: 600,
    bulletDamage: 15,
    assetKey: 'ship_pegasus',
    size: { width: 50, height: 50 }
  },
  dragon: {
    id: 'dragon',
    name: 'Dragon',
    description: 'Heavy firepower, slower movement',
    maxHealth: 120,
    maxArmor: 70,
    speed: 320,
    fireRate: 250,
    bulletSpeed: 550,
    bulletDamage: 25,
    assetKey: 'ship_dragon',
    size: { width: 60, height: 60 }
  },
  phoenix: {
    id: 'phoenix',
    name: 'Phoenix',
    description: 'High speed, fragile but deadly',
    maxHealth: 80,
    maxArmor: 30,
    speed: 480,
    fireRate: 140,
    bulletSpeed: 700,
    bulletDamage: 12,
    assetKey: 'ship_phoenix',
    size: { width: 45, height: 45 }
  },
  andromeda: {
    id: 'andromeda',
    name: 'Andromeda',
    description: 'Tank with strong armor',
    maxHealth: 150,
    maxArmor: 100,
    speed: 280,
    fireRate: 300,
    bulletSpeed: 500,
    bulletDamage: 20,
    assetKey: 'ship_andromeda',
    size: { width: 65, height: 65 }
  },
  cygnus: {
    id: 'cygnus',
    name: 'Cygnus',
    description: 'Rapid fire specialist',
    maxHealth: 90,
    maxArmor: 40,
    speed: 380,
    fireRate: 120,
    bulletSpeed: 650,
    bulletDamage: 10,
    assetKey: 'ship_cygnus',
    size: { width: 48, height: 48 }
  }
};

// Default ship for new players
export const DEFAULT_SHIP = 'pegasus';
