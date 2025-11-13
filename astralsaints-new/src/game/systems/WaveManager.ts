import Phaser from 'phaser';
import { WavePattern, MovementPattern, FormationType } from '../../config/wavePatterns';
import { ENEMY_TYPES } from '../../config/enemies';

interface SpawnedEnemy {
  sprite: Phaser.Physics.Arcade.Sprite;
  targetPos: { x: number; y: number };
  isInFormation: boolean;
  side: 'left' | 'right';
}

export class WaveManager {
  private scene: Phaser.Scene;
  private enemyGroup: Phaser.Physics.Arcade.Group;
  private activeEnemies: SpawnedEnemy[] = [];
  private currentWavePattern?: WavePattern;
  private waveActive: boolean = false;
  private enemiesSpawned: number = 0;
  private totalEnemies: number = 0;

  constructor(scene: Phaser.Scene, enemyGroup: Phaser.Physics.Arcade.Group) {
    this.scene = scene;
    this.enemyGroup = enemyGroup;
  }

  public startWave(wavePattern: WavePattern) {
    if (this.waveActive) {
      console.warn('Wave already active!');
      return;
    }

    this.currentWavePattern = wavePattern;
    this.waveActive = true;
    this.enemiesSpawned = 0;
    this.activeEnemies = [];

    // Calculate total enemies
    this.totalEnemies = wavePattern.enemies.reduce((sum, e) => sum + e.count, 0);

    // Start spawning
    this.spawnWave();
  }

  private spawnWave() {
    if (!this.currentWavePattern) return;

    const pattern = this.currentWavePattern;
    const { left, right } = pattern.entrancePattern;

    // Calculate how many of each enemy type to spawn
    const enemyTypes: string[] = [];
    pattern.enemies.forEach(enemyDef => {
      for (let i = 0; i < enemyDef.count; i++) {
        enemyTypes.push(enemyDef.type);
      }
    });

    // Shuffle for variety
    Phaser.Utils.Array.Shuffle(enemyTypes);

    // Spawn enemies from left and right alternately
    let leftIndex = 0;
    let rightIndex = 0;
    let currentIndex = 0;

    const spawnTimer = this.scene.time.addEvent({
      delay: pattern.spawnDelay,
      callback: () => {
        if (currentIndex >= this.totalEnemies) {
          spawnTimer.destroy();
          // Start formation phase after all spawned
          this.scene.time.delayedCall(1000, () => this.formFormation());
          return;
        }

        // Alternate between left and right spawns
        const spawnFromLeft = leftIndex < left.count;

        if (spawnFromLeft) {
          this.spawnEnemy(enemyTypes[currentIndex], 'left', left.pattern);
          leftIndex++;
        } else if (rightIndex < right.count) {
          this.spawnEnemy(enemyTypes[currentIndex], 'right', right.pattern);
          rightIndex++;
        }

        currentIndex++;
        this.enemiesSpawned++;
      },
      loop: true
    });
  }

  private spawnEnemy(enemyType: string, side: 'left' | 'right', movementPattern: MovementPattern) {
    const enemyConfig = ENEMY_TYPES[enemyType];
    if (!enemyConfig) return;

    // Spawn position (off-screen top)
    const screenWidth = this.scene.scale.width;
    const spawnX = side === 'left' ? -50 : screenWidth + 50;
    const spawnY = Phaser.Math.Between(-100, -50);

    const enemy = this.enemyGroup.create(spawnX, spawnY, 'enemy');
    enemy.setDisplaySize(enemyConfig.size.width, enemyConfig.size.height);
    enemy.setData('health', enemyConfig.health);
    enemy.setData('maxHealth', enemyConfig.health);
    enemy.setData('type', enemyType);
    enemy.setData('scoreValue', enemyConfig.scoreValue);
    enemy.setData('lastFired', 0);
    enemy.setData('fireRate', enemyConfig.fireRate);
    enemy.setTint(enemyConfig.color);

    // Apply movement pattern
    this.applyMovementPattern(enemy, side, movementPattern);

    // Track this enemy
    this.activeEnemies.push({
      sprite: enemy,
      targetPos: { x: 0, y: 0 }, // Will be set during formation
      isInFormation: false,
      side
    });
  }

  private applyMovementPattern(
    enemy: Phaser.Physics.Arcade.Sprite,
    side: 'left' | 'right',
    pattern: MovementPattern
  ) {
    const screenWidth = this.scene.scale.width;
    const centerX = screenWidth / 2;
    const speed = ENEMY_TYPES[enemy.getData('type')]?.speed || 100;

    switch (pattern) {
      case 'swirl_left':
      case 'swirl_right': {
        // Curve toward center with tween
        const targetX = side === 'left' ? centerX - 100 : centerX + 100;
        const targetY = 150;

        this.scene.tweens.add({
          targets: enemy,
          x: targetX,
          y: targetY,
          duration: 1500,
          ease: side === 'left' ? 'Sine.easeInOut' : 'Sine.easeInOut'
        });
        break;
      }

      case 'straight_down': {
        enemy.setVelocityY(speed);
        break;
      }

      case 'zigzag': {
        enemy.setVelocityY(speed);
        // Zigzag motion
        this.scene.tweens.add({
          targets: enemy,
          x: side === 'left' ? '+=100' : '-=100',
          duration: 500,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });
        break;
      }

      case 'sine_wave': {
        const startX = enemy.x;
        enemy.setVelocityY(speed);
        // Sine wave motion
        enemy.setData('sineOffset', 0);
        enemy.setData('startX', startX);
        break;
      }
    }
  }

  private formFormation() {
    if (!this.currentWavePattern) return;

    const formation = this.currentWavePattern.formation;
    const screenWidth = this.scene.scale.width;
    const screenHeight = this.scene.scale.height;
    const centerX = screenWidth / 2;
    const formationY = screenHeight * formation.yPosition;

    // Calculate formation positions
    const positions = this.calculateFormationPositions(
      formation.type,
      this.activeEnemies.length,
      centerX,
      formationY,
      formation.spacing
    );

    // Assign positions and tween enemies into formation
    this.activeEnemies.forEach((enemyData, index) => {
      if (index >= positions.length) return;

      enemyData.targetPos = positions[index];

      // Stagger shooting timing to avoid all enemies firing at once
      // Give each enemy a random offset for their first shot
      const fireRate = enemyData.sprite.getData('fireRate');
      if (fireRate) {
        const randomOffset = Phaser.Math.Between(0, fireRate * 0.8);
        enemyData.sprite.setData('lastFired', this.scene.time.now - fireRate + randomOffset);
      }

      // Tween to formation position
      this.scene.tweens.add({
        targets: enemyData.sprite,
        x: enemyData.targetPos.x,
        y: enemyData.targetPos.y,
        duration: 1000,
        ease: 'Cubic.easeOut',
        onComplete: () => {
          enemyData.isInFormation = true;
          // Stop any velocity once in formation
          enemyData.sprite.setVelocity(0, 0);
        }
      });
    });
  }

  private calculateFormationPositions(
    type: FormationType,
    count: number,
    centerX: number,
    centerY: number,
    spacing: number
  ): Array<{ x: number; y: number }> {
    const positions: Array<{ x: number; y: number }> = [];

    switch (type) {
      case 'line_horizontal': {
        const totalWidth = (count - 1) * spacing;
        const startX = centerX - totalWidth / 2;
        for (let i = 0; i < count; i++) {
          positions.push({ x: startX + i * spacing, y: centerY });
        }
        break;
      }

      case 'line_vertical': {
        const columns = Math.ceil(Math.sqrt(count));
        const columnWidth = spacing * 2;
        const startX = centerX - ((columns - 1) * columnWidth) / 2;

        for (let i = 0; i < count; i++) {
          const col = i % columns;
          const row = Math.floor(i / columns);
          positions.push({
            x: startX + col * columnWidth,
            y: centerY + row * spacing
          });
        }
        break;
      }

      case 'v_formation': {
        const rowCount = Math.ceil(count / 2);
        for (let i = 0; i < count; i++) {
          const row = Math.floor(i / 2);
          const side = i % 2 === 0 ? -1 : 1;
          positions.push({
            x: centerX + side * row * (spacing * 0.8),
            y: centerY + row * spacing
          });
        }
        break;
      }

      case 'circle': {
        const radius = spacing * 2;
        const angleStep = (Math.PI * 2) / count;
        for (let i = 0; i < count; i++) {
          const angle = i * angleStep;
          positions.push({
            x: centerX + Math.cos(angle) * radius,
            y: centerY + Math.sin(angle) * radius
          });
        }
        break;
      }

      case 'diamond': {
        const layers = Math.ceil(Math.sqrt(count));
        let index = 0;
        for (let layer = 0; layer < layers && index < count; layer++) {
          const layerSize = layer === 0 ? 1 : layer * 4;
          for (let i = 0; i < layerSize && index < count; i++) {
            const angle = (i / layerSize) * Math.PI * 2;
            const distance = layer * spacing;
            positions.push({
              x: centerX + Math.cos(angle) * distance,
              y: centerY + Math.sin(angle) * distance
            });
            index++;
          }
        }
        break;
      }

      case 'square': {
        const perSide = Math.ceil(Math.sqrt(count));
        let index = 0;
        for (let row = 0; row < perSide && index < count; row++) {
          for (let col = 0; col < perSide && index < count; col++) {
            positions.push({
              x: centerX - ((perSide - 1) * spacing) / 2 + col * spacing,
              y: centerY - ((perSide - 1) * spacing) / 2 + row * spacing
            });
            index++;
          }
        }
        break;
      }

      case 'staggered': {
        // Valley-mountain-valley pattern with alternating heights
        const totalWidth = (count - 1) * spacing;
        const startX = centerX - totalWidth / 2;
        const yVariation = 60; // How much height variation

        for (let i = 0; i < count; i++) {
          // Alternate between high (valley) and low (mountain)
          const yOffset = (i % 2 === 0) ? -yVariation : yVariation;
          positions.push({
            x: startX + i * spacing,
            y: centerY + yOffset
          });
        }
        break;
      }

      case 'scattered': {
        const screenWidth = this.scene.scale.width;
        const scatterArea = { width: screenWidth * 0.8, height: 150 };
        for (let i = 0; i < count; i++) {
          positions.push({
            x: centerX - scatterArea.width / 2 + Math.random() * scatterArea.width,
            y: centerY - scatterArea.height / 2 + Math.random() * scatterArea.height
          });
        }
        break;
      }
    }

    return positions;
  }

  public update() {
    // Update sine wave enemies
    this.activeEnemies.forEach(enemyData => {
      const enemy = enemyData.sprite;
      if (!enemy.active) return;

      // Sine wave motion update
      if (enemy.getData('startX') !== undefined) {
        const sineOffset = enemy.getData('sineOffset') || 0;
        const newOffset = sineOffset + 0.05;
        enemy.setData('sineOffset', newOffset);
        const amplitude = 80;
        enemy.x = enemy.getData('startX') + Math.sin(newOffset) * amplitude;
      }
    });

    // Clean up destroyed enemies
    this.activeEnemies = this.activeEnemies.filter(e => e.sprite.active);

    // Check if wave is complete
    if (this.waveActive && this.activeEnemies.length === 0 && this.enemiesSpawned === this.totalEnemies) {
      this.waveActive = false;
      // Emit event or callback that wave is complete
    }
  }

  public isWaveActive(): boolean {
    return this.waveActive;
  }

  public getActiveEnemyCount(): number {
    return this.activeEnemies.length;
  }
}
