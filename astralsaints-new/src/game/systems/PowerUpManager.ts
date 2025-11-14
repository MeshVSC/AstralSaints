import Phaser from 'phaser';
import { PowerUpType, POWERUP_TYPES, DROP_CHANCES } from '../../config/powerups';
import { WeaponType, WEAPON_TYPES } from '../../config/weapons';

interface ActivePowerUp {
  type: PowerUpType;
  startTime: number;
  duration: number;
}

export class PowerUpManager {
  private scene: Phaser.Scene;
  private powerUpGroup: Phaser.Physics.Arcade.Group;
  private activePowerUps: Map<PowerUpType, ActivePowerUp> = new Map();

  // Current boosts
  public damageMultiplier: number = 1.0;
  public speedMultiplier: number = 1.0;
  public fireRateMultiplier: number = 1.0;
  public currentWeapon: WeaponType = 'normal';
  public weaponChangeTime: number = 0;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    // Create power-up sprites
    this.createPowerUpGraphics();

    // Power-up group
    this.powerUpGroup = scene.physics.add.group({
      classType: Phaser.Physics.Arcade.Sprite
    });
  }

  private createPowerUpGraphics() {
    // Create textures for each power-up type
    Object.values(POWERUP_TYPES).forEach(powerup => {
      const graphics = this.scene.add.graphics();

      // Outer glow
      graphics.fillStyle(powerup.color, 0.3);
      graphics.fillCircle(12, 12, 12);

      // Inner core
      graphics.fillStyle(powerup.color, 1.0);
      graphics.fillCircle(12, 12, 8);

      // Symbol in center
      graphics.lineStyle(2, 0xffffff, 1.0);
      switch (powerup.id) {
        case 'damage':
          // Sword
          graphics.strokeRect(9, 6, 6, 12);
          break;
        case 'speed':
          // Arrow
          graphics.beginPath();
          graphics.moveTo(12, 6);
          graphics.lineTo(18, 12);
          graphics.lineTo(12, 18);
          graphics.strokePath();
          break;
        case 'shield':
          // Shield
          graphics.strokeCircle(12, 12, 5);
          break;
        case 'firerate':
          // Triple lines
          graphics.strokeLineShape(new Phaser.Geom.Line(8, 12, 16, 12));
          graphics.strokeLineShape(new Phaser.Geom.Line(8, 9, 16, 9));
          graphics.strokeLineShape(new Phaser.Geom.Line(8, 15, 16, 15));
          break;
        case 'weapon':
          // Star
          graphics.fillStyle(0xffffff, 1.0);
          graphics.fillStar(12, 12, 5, 4, 2);
          break;
      }

      graphics.generateTexture(`powerup_${powerup.id}`, 24, 24);
      graphics.destroy();
    });
  }

  public spawnPowerUp(x: number, y: number): void {
    // Determine what to drop based on chances
    const roll = Math.random() * 100;
    let cumulative = 0;
    let droppedType: PowerUpType | null = null;

    for (const [type, chance] of Object.entries(DROP_CHANCES)) {
      cumulative += chance;
      if (roll < cumulative) {
        if (type !== 'none') {
          droppedType = type as PowerUpType;
        }
        break;
      }
    }

    if (!droppedType) return;

    // Create power-up pickup
    const powerup = this.powerUpGroup.create(x, y, `powerup_${droppedType}`);
    powerup.setData('type', droppedType);
    powerup.setVelocityY(100); // Falls down slowly
    powerup.setDisplaySize(24, 24);

    // Pulse animation
    this.scene.tweens.add({
      targets: powerup,
      scale: 1.2,
      duration: 500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Auto-destroy after falling off screen
    this.scene.time.delayedCall(5000, () => {
      if (powerup.active) powerup.destroy();
    });
  }

  public collectPowerUp(pickup: Phaser.Physics.Arcade.Sprite): void {
    const type = pickup.getData('type') as PowerUpType;
    const config = POWERUP_TYPES[type];

    if (!config) return;

    // Apply effect
    if (config.effect.type === 'stat_boost') {
      this.applyStatBoost(type, config);
    } else if (config.effect.type === 'temp_armor') {
      // Handled by game scene directly
    } else if (config.effect.type === 'weapon_change') {
      this.changeWeapon();
    }

    // Visual feedback
    const text = this.scene.add.text(pickup.x, pickup.y - 30, config.name, {
      fontSize: '14px',
      color: `#${config.color.toString(16).padStart(6, '0')}`
    }).setOrigin(0.5);

    this.scene.tweens.add({
      targets: text,
      y: pickup.y - 60,
      alpha: 0,
      duration: 1000,
      onComplete: () => text.destroy()
    });

    pickup.destroy();
  }

  private applyStatBoost(type: PowerUpType, config: any): void {
    const now = this.scene.time.now;

    // Remove existing power-up of same type
    this.activePowerUps.delete(type);

    // Add new power-up
    this.activePowerUps.set(type, {
      type,
      startTime: now,
      duration: config.duration
    });

    // Apply multiplier
    switch (config.effect.stat) {
      case 'damage':
        this.damageMultiplier = config.effect.multiplier;
        break;
      case 'speed':
        this.speedMultiplier = config.effect.multiplier;
        break;
      case 'fireRate':
        this.fireRateMultiplier = config.effect.multiplier;
        break;
    }
  }

  private changeWeapon(): void {
    // Pick random weapon (not normal)
    const weapons: WeaponType[] = ['spread', 'laser', 'wave', 'rapid'];
    const newWeapon = Phaser.Utils.Array.GetRandom(weapons);

    this.currentWeapon = newWeapon;
    this.weaponChangeTime = this.scene.time.now;

    // Revert after 20 seconds
    this.scene.time.delayedCall(20000, () => {
      this.currentWeapon = 'normal';
    });
  }

  public update(): void {
    const now = this.scene.time.now;

    // Check expired power-ups
    this.activePowerUps.forEach((powerup, type) => {
      if (now > powerup.startTime + powerup.duration) {
        // Expired - remove and reset multiplier
        this.activePowerUps.delete(type);

        const config = POWERUP_TYPES[type];
        if (config.effect.stat === 'damage') {
          this.damageMultiplier = 1.0;
        } else if (config.effect.stat === 'speed') {
          this.speedMultiplier = 1.0;
        } else if (config.effect.stat === 'fireRate') {
          this.fireRateMultiplier = 1.0;
        }
      }
    });

    // Cleanup off-screen power-ups
    this.powerUpGroup.children.each((powerup: Phaser.GameObjects.GameObject) => {
      const p = powerup as Phaser.Physics.Arcade.Sprite;
      if (p.y > this.scene.scale.height + 50) {
        p.destroy();
      }
    });
  }

  public getPowerUpGroup(): Phaser.Physics.Arcade.Group {
    return this.powerUpGroup;
  }

  public getActivePowerUps(): ActivePowerUp[] {
    return Array.from(this.activePowerUps.values());
  }
}
