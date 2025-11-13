// Skill Tree system - 4 branches: Power, Tactics, Survival, Resources
// Data structure only - implementation comes later

export type SkillNodeType = 'small' | 'gate' | 'keystone';
export type SkillBranch = 'power' | 'tactics' | 'survival' | 'resources';

export interface SkillNode {
  id: string;
  branch: SkillBranch;
  type: SkillNodeType;
  name: string;
  description: string;

  // Requirements
  cost: number; // Skill points required
  prerequisites: string[]; // IDs of nodes that must be unlocked first

  // Effects (descriptive for now)
  effects: {
    stat?: string; // e.g., 'damage', 'fireRate', 'health'
    value?: number; // e.g., 0.05 for +5%
    special?: string; // Special effect description
  }[];

  // Position in tree (for UI later)
  position: {
    row: number; // 0-based
    column: number; // 0-based within branch
  };
}

// Skill tree definition
export const SKILL_TREE: Record<string, SkillNode> = {
  // POWER BRANCH - Damage and offensive capabilities
  power_damage_1: {
    id: 'power_damage_1',
    branch: 'power',
    type: 'small',
    name: 'Weapon Enhancement I',
    description: '+5% weapon damage',
    cost: 1,
    prerequisites: [],
    effects: [{ stat: 'damage', value: 0.05 }],
    position: { row: 0, column: 0 }
  },
  power_damage_2: {
    id: 'power_damage_2',
    branch: 'power',
    type: 'small',
    name: 'Weapon Enhancement II',
    description: '+5% weapon damage',
    cost: 1,
    prerequisites: ['power_damage_1'],
    effects: [{ stat: 'damage', value: 0.05 }],
    position: { row: 1, column: 0 }
  },
  power_gate_heavy: {
    id: 'power_gate_heavy',
    branch: 'power',
    type: 'gate',
    name: 'Heavy Ordnance',
    description: 'Unlocks explosive shot modifications',
    cost: 3,
    prerequisites: ['power_damage_2'],
    effects: [{ special: 'Unlock explosive weapon mods' }],
    position: { row: 2, column: 0 }
  },
  power_firerate_1: {
    id: 'power_firerate_1',
    branch: 'power',
    type: 'small',
    name: 'Rapid Fire I',
    description: '+8% fire rate',
    cost: 1,
    prerequisites: [],
    effects: [{ stat: 'fireRate', value: 0.08 }],
    position: { row: 0, column: 1 }
  },
  power_keystone_annihilation: {
    id: 'power_keystone_annihilation',
    branch: 'power',
    type: 'keystone',
    name: 'Annihilation Protocol',
    description: '+25% damage but -10% fire rate',
    cost: 5,
    prerequisites: ['power_gate_heavy'],
    effects: [
      { stat: 'damage', value: 0.25 },
      { stat: 'fireRate', value: -0.10 }
    ],
    position: { row: 3, column: 0 }
  },

  // TACTICS BRANCH - Movement and positioning
  tactics_speed_1: {
    id: 'tactics_speed_1',
    branch: 'tactics',
    type: 'small',
    name: 'Thruster Boost I',
    description: '+6% movement speed',
    cost: 1,
    prerequisites: [],
    effects: [{ stat: 'speed', value: 0.06 }],
    position: { row: 0, column: 0 }
  },
  tactics_dodge: {
    id: 'tactics_dodge',
    branch: 'tactics',
    type: 'small',
    name: 'Evasive Maneuvers',
    description: '+10% dodge chance',
    cost: 2,
    prerequisites: ['tactics_speed_1'],
    effects: [{ stat: 'dodgeChance', value: 0.10 }],
    position: { row: 1, column: 0 }
  },
  tactics_gate_phase: {
    id: 'tactics_gate_phase',
    branch: 'tactics',
    type: 'gate',
    name: 'Phase Shift',
    description: 'Unlocks dash ability',
    cost: 3,
    prerequisites: ['tactics_dodge'],
    effects: [{ special: 'Unlock dash ability' }],
    position: { row: 2, column: 0 }
  },
  tactics_keystone_untouchable: {
    id: 'tactics_keystone_untouchable',
    branch: 'tactics',
    type: 'keystone',
    name: 'Untouchable',
    description: '+30% speed, +20% dodge, but -20% armor',
    cost: 5,
    prerequisites: ['tactics_gate_phase'],
    effects: [
      { stat: 'speed', value: 0.30 },
      { stat: 'dodgeChance', value: 0.20 },
      { stat: 'armor', value: -0.20 }
    ],
    position: { row: 3, column: 0 }
  },

  // SURVIVAL BRANCH - Defense and sustain
  survival_health_1: {
    id: 'survival_health_1',
    branch: 'survival',
    type: 'small',
    name: 'Hull Reinforcement I',
    description: '+8% max health',
    cost: 1,
    prerequisites: [],
    effects: [{ stat: 'health', value: 0.08 }],
    position: { row: 0, column: 0 }
  },
  survival_armor_1: {
    id: 'survival_armor_1',
    branch: 'survival',
    type: 'small',
    name: 'Armor Plating I',
    description: '+10% armor',
    cost: 1,
    prerequisites: [],
    effects: [{ stat: 'armor', value: 0.10 }],
    position: { row: 0, column: 1 }
  },
  survival_regen: {
    id: 'survival_regen',
    branch: 'survival',
    type: 'small',
    name: 'Regeneration',
    description: 'Slowly regenerate 1% health per second',
    cost: 2,
    prerequisites: ['survival_health_1'],
    effects: [{ special: 'Health regeneration: 1% per second' }],
    position: { row: 1, column: 0 }
  },
  survival_gate_fortress: {
    id: 'survival_gate_fortress',
    branch: 'survival',
    type: 'gate',
    name: 'Fortress Mode',
    description: 'Unlocks shield abilities',
    cost: 3,
    prerequisites: ['survival_armor_1', 'survival_regen'],
    effects: [{ special: 'Unlock shield abilities' }],
    position: { row: 2, column: 0 }
  },
  survival_keystone_juggernaut: {
    id: 'survival_keystone_juggernaut',
    branch: 'survival',
    type: 'keystone',
    name: 'Juggernaut',
    description: '+40% health, +30% armor, but -15% speed',
    cost: 5,
    prerequisites: ['survival_gate_fortress'],
    effects: [
      { stat: 'health', value: 0.40 },
      { stat: 'armor', value: 0.30 },
      { stat: 'speed', value: -0.15 }
    ],
    position: { row: 3, column: 0 }
  },

  // RESOURCES BRANCH - Economy and drops
  resources_drops_1: {
    id: 'resources_drops_1',
    branch: 'resources',
    type: 'small',
    name: 'Scavenger I',
    description: '+15% drop rate',
    cost: 1,
    prerequisites: [],
    effects: [{ stat: 'dropRate', value: 0.15 }],
    position: { row: 0, column: 0 }
  },
  resources_score: {
    id: 'resources_score',
    branch: 'resources',
    type: 'small',
    name: 'Point Multiplier',
    description: '+10% score gain',
    cost: 1,
    prerequisites: [],
    effects: [{ stat: 'scoreMultiplier', value: 0.10 }],
    position: { row: 0, column: 1 }
  },
  resources_gate_fortune: {
    id: 'resources_gate_fortune',
    branch: 'resources',
    type: 'gate',
    name: 'Fortune Favors',
    description: 'Unlocks rare drop bonuses',
    cost: 3,
    prerequisites: ['resources_drops_1'],
    effects: [{ special: 'Increased rare drop chance' }],
    position: { row: 2, column: 0 }
  },
  resources_keystone_abundance: {
    id: 'resources_keystone_abundance',
    branch: 'resources',
    type: 'keystone',
    name: 'Cosmic Abundance',
    description: '+50% drops, +25% score, but enemies 10% tougher',
    cost: 5,
    prerequisites: ['resources_gate_fortune'],
    effects: [
      { stat: 'dropRate', value: 0.50 },
      { stat: 'scoreMultiplier', value: 0.25 },
      { special: 'Enemies gain +10% health' }
    ],
    position: { row: 3, column: 0 }
  }
};

// Helper functions
export function getSkillsByBranch(branch: SkillBranch): SkillNode[] {
  return Object.values(SKILL_TREE).filter(node => node.branch === branch);
}

export function getSkillById(id: string): SkillNode | undefined {
  return SKILL_TREE[id];
}

export function canUnlockSkill(skillId: string, unlockedSkills: string[]): boolean {
  const skill = SKILL_TREE[skillId];
  if (!skill) return false;

  // Check if all prerequisites are unlocked
  return skill.prerequisites.every(prereq => unlockedSkills.includes(prereq));
}
