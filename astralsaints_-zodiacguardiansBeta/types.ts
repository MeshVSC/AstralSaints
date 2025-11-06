export enum GameState {
  MainMenu,
  Playing,
  GameOver,
}

export enum ShipType {
  Pegasus = 'Pegasus',
  Dragon = 'Dragon',
  Cygnus = 'Cygnus',
  Andromeda = 'Andromeda',
  Phoenix = 'Phoenix',
}

export enum ShipWeaponType {
  Spread,
  TriBeam,
  Pulse,
  Wave,
  Charge,
}

export enum FormLevel {
  I = 1,
  II = 2,
  III = 3,
}

export interface Vector2D {
  x: number;
  y: number;
}

export interface GameObject {
  id: string;
  position: Vector2D;
  size: { width: number; height: number };
}

export interface PlayerState extends GameObject {
  health: number;
  maxHealth: number;
  form: FormLevel;
  isAwakened: boolean;
  awakeningEndTime: number;
  lastFired: number;
  powerLevel: number;
  fireRateLevel: number;
  lastEvolutionTime: number; // For triggering visual effect
  specialWeaponReady: boolean;
  specialWeaponCooldown: number; // Time remaining
}

export enum EnemyType {
  Scout, // Replaces Grunt - Small, fast
  Striker, // Replaces Shooter - Medium, fires projectiles
  Bruiser, // Replaces Kamikaze - Large, tanky
  Boss,
}

export interface EnemyState extends GameObject {
  health: number;
  maxHealth: number;
  type: EnemyType;
  lastFired?: number;
  points: number;
  vx?: number; // For horizontal movement
  spawnTime?: number; // For wave-based spawning
}

export interface ProjectileState extends GameObject {
  owner: 'player' | 'enemy';
  damage: number;
  velocity: Vector2D;
  weaponType?: ShipWeaponType; // For visual styling
}

export interface ParticleState extends GameObject {
  velocity: Vector2D;
  lifetime: number;
  maxLifetime: number;
  color: string;
}

export enum PowerUpType {
  Power = 'Power',
  Rate = 'Rate',
}

export interface PowerUpState extends GameObject {
  type: PowerUpType;
}

export interface EnemySpawnConfig {
  type: EnemyType;
  x: number; // 0-1 range for position
  delay: number; // ms after wave start
}

export interface Wave {
  name: string;
  enemies: EnemySpawnConfig[];
}

export interface GameLogicState {
  player: PlayerState;
  enemies: EnemyState[];
  projectiles: ProjectileState[];
  particles: ParticleState[];
  powerUps: PowerUpState[];
  keys: Record<string, boolean>;
  score: number;
  combo: number;
  comboTimer: number;
  gameTime: number;
  bossActive: boolean;
  nextBossScore: number;
  currentWaveIndex: number;
  waveClearTimer: number; // Cooldown between waves
  powerUpDroppedThisWave: boolean;
  isSpawning: boolean;
}