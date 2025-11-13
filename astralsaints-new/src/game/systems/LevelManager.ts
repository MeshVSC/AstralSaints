import Phaser from 'phaser';
import { WaveManager } from './WaveManager';
import { LevelConfig, getLevel } from '../../config/levels';
import { WAVE_PATTERNS } from '../../config/wavePatterns';

export class LevelManager {
  private scene: Phaser.Scene;
  private waveManager: WaveManager;
  private currentLevel?: LevelConfig;
  private currentWaveIndex: number = 0;
  private levelComplete: boolean = false;
  private waitingForNextWave: boolean = false;

  constructor(scene: Phaser.Scene, waveManager: WaveManager) {
    this.scene = scene;
    this.waveManager = waveManager;
  }

  public startLevel(levelId: number) {
    const level = getLevel(levelId);
    if (!level) {
      console.error(`Level ${levelId} not found!`);
      return;
    }

    this.currentLevel = level;
    this.currentWaveIndex = 0;
    this.levelComplete = false;
    this.waitingForNextWave = false;

    console.log(`Starting Level ${levelId}: ${level.name}`);

    // Start first wave
    this.startNextWave();
  }

  private startNextWave() {
    if (!this.currentLevel) return;

    if (this.currentWaveIndex >= this.currentLevel.waves.length) {
      // All waves complete!
      this.levelComplete = true;
      console.log('Level complete!');
      return;
    }

    const wavePatternId = this.currentLevel.waves[this.currentWaveIndex];
    const wavePattern = WAVE_PATTERNS[wavePatternId];

    if (!wavePattern) {
      console.error(`Wave pattern ${wavePatternId} not found!`);
      return;
    }

    console.log(`Starting wave ${this.currentWaveIndex + 1}/${this.currentLevel.waves.length}: ${wavePattern.name}`);

    // Apply difficulty multiplier to wave
    const modifiedPattern = this.applyDifficultyMultiplier(wavePattern, this.currentLevel.difficultyMultiplier);

    this.waveManager.startWave(modifiedPattern);
    this.currentWaveIndex++;
    this.waitingForNextWave = false;
  }

  private applyDifficultyMultiplier(wavePattern: any, multiplier: number): any {
    // Clone the pattern to avoid modifying the original
    return {
      ...wavePattern,
      enemies: wavePattern.enemies.map((e: any) => ({
        ...e,
        // Could modify enemy stats here based on difficulty
        // For now, we'll handle this in the enemy spawn logic
      }))
    };
  }

  public update() {
    // Check if current wave is done and start next
    if (!this.waveManager.isWaveActive() && !this.levelComplete && !this.waitingForNextWave) {
      // Wait a bit before next wave
      if (this.currentWaveIndex < (this.currentLevel?.waves.length || 0)) {
        this.waitingForNextWave = true;
        const wavePattern = WAVE_PATTERNS[this.currentLevel!.waves[this.currentWaveIndex]];
        this.scene.time.delayedCall(wavePattern?.waveDelay || 2000, () => {
          this.startNextWave();
        });
      }
    }
  }

  public isLevelComplete(): boolean {
    return this.levelComplete;
  }

  public getCurrentWaveNumber(): number {
    return this.currentWaveIndex;
  }

  public getTotalWaves(): number {
    return this.currentLevel?.waves.length || 0;
  }

  public getCurrentLevel(): LevelConfig | undefined {
    return this.currentLevel;
  }

  public getDifficultyMultiplier(): number {
    return this.currentLevel?.difficultyMultiplier || 1.0;
  }
}
