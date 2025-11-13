// Wave pattern definitions - how enemies enter and form formations

export type MovementPattern =
  | 'swirl_left'    // Swirl in from left side
  | 'swirl_right'   // Swirl in from right side
  | 'straight_down' // Straight down
  | 'zigzag'        // Zigzag pattern
  | 'sine_wave';    // Sine wave pattern

export type FormationType =
  | 'line_horizontal' // Horizontal line
  | 'line_vertical'   // Vertical line
  | 'v_formation'     // V shape
  | 'circle'          // Circle formation
  | 'square'          // Square formation
  | 'diamond'         // Diamond formation
  | 'staggered'       // Staggered with gaps - valley/mountain pattern
  | 'scattered';      // No formation, stay scattered

export interface WavePattern {
  id: string;
  name: string;
  description: string;

  // Enemy composition
  enemies: Array<{
    type: string; // enemy type id
    count: number;
  }>;

  // Movement configuration
  entrancePattern: {
    left: {
      pattern: MovementPattern;
      count: number; // how many come from left
    };
    right: {
      pattern: MovementPattern;
      count: number; // how many come from right
    };
  };

  // Formation they form after entrance
  formation: {
    type: FormationType;
    yPosition: number; // y position where formation settles (0-1, percentage of screen)
    spacing: number; // space between enemies in formation
    duration: number; // how long to hold formation (ms), 0 = until destroyed
  };

  // Timing
  spawnDelay: number; // ms between spawning each enemy
  waveDelay: number; // ms before next wave can start
}

// Pre-defined wave patterns
export const WAVE_PATTERNS: Record<string, WavePattern> = {
  // Early game patterns - simple and predictable
  basic_pincer: {
    id: 'basic_pincer',
    name: 'Basic Pincer',
    description: '6 scouts from each side, form staggered line with gaps',
    enemies: [{ type: 'scout', count: 12 }],
    entrancePattern: {
      left: { pattern: 'swirl_left', count: 6 },
      right: { pattern: 'swirl_right', count: 6 }
    },
    formation: {
      type: 'staggered',
      yPosition: 0.2,
      spacing: 90,
      duration: 0
    },
    spawnDelay: 150,
    waveDelay: 3000
  },

  v_attack: {
    id: 'v_attack',
    name: 'V Attack',
    description: 'Fighters form wide V formation with gaps',
    enemies: [{ type: 'fighter', count: 8 }],
    entrancePattern: {
      left: { pattern: 'swirl_left', count: 4 },
      right: { pattern: 'swirl_right', count: 4 }
    },
    formation: {
      type: 'v_formation',
      yPosition: 0.25,
      spacing: 100,
      duration: 0
    },
    spawnDelay: 200,
    waveDelay: 3500
  },

  drone_swarm: {
    id: 'drone_swarm',
    name: 'Drone Swarm',
    description: 'Fast drones in very scattered formation',
    enemies: [{ type: 'drone', count: 16 }],
    entrancePattern: {
      left: { pattern: 'swirl_left', count: 8 },
      right: { pattern: 'swirl_right', count: 8 }
    },
    formation: {
      type: 'scattered',
      yPosition: 0.3,
      spacing: 70,
      duration: 0
    },
    spawnDelay: 120,
    waveDelay: 4000
  },

  heavy_circle: {
    id: 'heavy_circle',
    name: 'Heavy Circle',
    description: 'Heavy units form wide defensive circle',
    enemies: [{ type: 'heavy', count: 6 }],
    entrancePattern: {
      left: { pattern: 'swirl_left', count: 3 },
      right: { pattern: 'swirl_right', count: 3 }
    },
    formation: {
      type: 'circle',
      yPosition: 0.25,
      spacing: 120,
      duration: 0
    },
    spawnDelay: 250,
    waveDelay: 4000
  },

  mixed_assault: {
    id: 'mixed_assault',
    name: 'Mixed Assault',
    description: 'Combination of scouts and fighters in staggered formation',
    enemies: [
      { type: 'scout', count: 6 },
      { type: 'fighter', count: 4 }
    ],
    entrancePattern: {
      left: { pattern: 'swirl_left', count: 5 },
      right: { pattern: 'swirl_right', count: 5 }
    },
    formation: {
      type: 'staggered',
      yPosition: 0.25,
      spacing: 85,
      duration: 0
    },
    spawnDelay: 150,
    waveDelay: 3500
  },

  interceptor_rush: {
    id: 'interceptor_rush',
    name: 'Interceptor Rush',
    description: 'Fast interceptors in spaced vertical columns',
    enemies: [{ type: 'interceptor', count: 10 }],
    entrancePattern: {
      left: { pattern: 'sine_wave', count: 5 },
      right: { pattern: 'sine_wave', count: 5 }
    },
    formation: {
      type: 'line_vertical',
      yPosition: 0.2,
      spacing: 80,
      duration: 0
    },
    spawnDelay: 130,
    waveDelay: 3000
  }
};
