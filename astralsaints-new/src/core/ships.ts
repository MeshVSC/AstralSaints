// Ship definitions and stats
export enum ShipType {
  PEGASUS = 'Pegasus',
  DRAGON = 'Dragon',
  PHOENIX = 'Phoenix',
  ANDROMEDA = 'Andromeda',
  CYGNUS = 'Cygnus'
}

export enum WeaponType {
  SPREAD = 'Spread',
  TRIBEAM = 'TriBeam',
  PULSE = 'Pulse',
  WAVE = 'Wave',
  CHARGE = 'Charge'
}

export interface ShipStats {
  type: ShipType;
  weapon: WeaponType;
  health: number;
  speed: number;
  fireRate: number;
  damage: number;
}

export const SHIP_DATA: Record<ShipType, ShipStats> = {
  [ShipType.PEGASUS]: {
    type: ShipType.PEGASUS,
    weapon: WeaponType.SPREAD,
    health: 100,
    speed: 300,
    fireRate: 200,
    damage: 10
  },
  [ShipType.DRAGON]: {
    type: ShipType.DRAGON,
    weapon: WeaponType.TRIBEAM,
    health: 120,
    speed: 250,
    fireRate: 150,
    damage: 15
  },
  [ShipType.PHOENIX]: {
    type: ShipType.PHOENIX,
    weapon: WeaponType.CHARGE,
    health: 80,
    speed: 350,
    fireRate: 300,
    damage: 25
  },
  [ShipType.ANDROMEDA]: {
    type: ShipType.ANDROMEDA,
    weapon: WeaponType.WAVE,
    health: 90,
    speed: 280,
    fireRate: 250,
    damage: 12
  },
  [ShipType.CYGNUS]: {
    type: ShipType.CYGNUS,
    weapon: WeaponType.PULSE,
    health: 110,
    speed: 300,
    fireRate: 100,
    damage: 8
  }
};
