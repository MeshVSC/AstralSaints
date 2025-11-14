import Phaser from 'phaser';
import { WaveManager } from '../systems/WaveManager';
import { LevelManager } from '../systems/LevelManager';
import { PowerUpManager } from '../systems/PowerUpManager';
import { SHIPS, DEFAULT_SHIP } from '../../config/ships';
import { ENEMY_TYPES } from '../../config/enemies';
import { WEAPON_TYPES, WeaponType } from '../../config/weapons';

export default class GameScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private playerBullets!: Phaser.Physics.Arcade.Group;
  private enemies!: Phaser.Physics.Arcade.Group;
  private enemyBullets!: Phaser.Physics.Arcade.Group;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private spaceKey!: Phaser.Input.Keyboard.Key;
  private rKey!: Phaser.Input.Keyboard.Key;

  // Game state
  private score: number = 0;
  private health: number = 100;
  private armor: number = 50;
  private lastFired: number = 0;
  private currentShipId: string = DEFAULT_SHIP;
  private autoFire: boolean = false; // Toggle for auto-fire vs hold to fire

  // UI
  private scoreText!: Phaser.GameObjects.Text;
  private healthText!: Phaser.GameObjects.Text;
  private armorText!: Phaser.GameObjects.Text;
  private levelText!: Phaser.GameObjects.Text;
  private waveText!: Phaser.GameObjects.Text;

  // Systems
  private waveManager!: WaveManager;
  private levelManager!: LevelManager;
  private powerUpManager!: PowerUpManager;
  private currentLevel: number = 1;

  // Starfield
  private stars!: Phaser.GameObjects.Graphics;
  private starPositions: Array<{ x: number; y: number; speed: number }> = [];

  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    // Create starfield background
    this.createStarfield();

    // Get ship config
    const shipConfig = SHIPS[this.currentShipId];
    this.health = shipConfig.maxHealth;
    this.armor = shipConfig.maxArmor;

    // Player - smaller size for vertical screen
    const playerSize = Math.floor(shipConfig.size.width * 0.7); // 30% smaller
    this.player = this.physics.add.sprite(300, 800, '');
    this.player.setDisplaySize(playerSize, playerSize);
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00);
    playerGraphics.fillTriangle(playerSize/2, 0, 0, playerSize, playerSize, playerSize); // Triangle ship
    playerGraphics.generateTexture('player', playerSize, playerSize);
    playerGraphics.destroy();
    this.player.setTexture('player');
    this.player.setCollideWorldBounds(true);

    // Bullet groups
    this.playerBullets = this.physics.add.group({
      classType: Phaser.Physics.Arcade.Sprite,
      maxSize: 100,
      runChildUpdate: true
    });

    this.enemies = this.physics.add.group();
    this.enemyBullets = this.physics.add.group({
      classType: Phaser.Physics.Arcade.Sprite,
      maxSize: 200
    });

    // Create graphics for enemies and bullets
    this.createGraphics();

    // Controls
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.rKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.R);

    // A key to toggle auto-fire
    const aKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    aKey.on('down', () => {
      this.autoFire = !this.autoFire;
      const message = this.autoFire ? 'AUTO-FIRE ON' : 'AUTO-FIRE OFF';
      const text = this.add.text(this.scale.width / 2, this.scale.height / 2, message, {
        fontSize: '24px',
        color: this.autoFire ? '#00ff00' : '#ff0000'
      }).setOrigin(0.5);
      this.tweens.add({
        targets: text,
        alpha: 0,
        duration: 1000,
        onComplete: () => text.destroy()
      });
    });

    // UI
    this.createUI();

    // Collisions
    this.setupCollisions();

    // Initialize systems
    this.waveManager = new WaveManager(this, this.enemies);
    this.levelManager = new LevelManager(this, this.waveManager);
    this.powerUpManager = new PowerUpManager(this);

    // Start level 1
    this.levelManager.startLevel(this.currentLevel);

    // Enemy shooting timer
    this.time.addEvent({
      delay: 100, // Check every 100ms
      callback: this.updateEnemyShooting,
      callbackScope: this,
      loop: true
    });
  }

  private createStarfield() {
    // Create scrolling starfield
    const screenWidth = this.scale.width;
    const screenHeight = this.scale.height;

    // Generate star positions
    for (let i = 0; i < 100; i++) {
      this.starPositions.push({
        x: Math.random() * screenWidth,
        y: Math.random() * screenHeight,
        speed: Math.random() * 2 + 0.5
      });
    }

    this.stars = this.add.graphics();
  }

  private updateStarfield() {
    const screenHeight = this.scale.height;
    const screenWidth = this.scale.width;

    this.stars.clear();

    // Update and draw stars
    this.starPositions.forEach(star => {
      star.y += star.speed;
      if (star.y > screenHeight) {
        star.y = 0;
        star.x = Math.random() * screenWidth;
      }

      // Draw star (brighter = faster)
      const brightness = Math.floor((star.speed / 2.5) * 255);
      this.stars.fillStyle(Phaser.Display.Color.GetColor(brightness, brightness, brightness));
      this.stars.fillCircle(star.x, star.y, 1);
    });
  }

  private createGraphics() {
    // Bullet graphics - smaller
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0x00ffff);
    bulletGraphics.fillRect(0, 0, 3, 12);
    bulletGraphics.generateTexture('bullet', 3, 12);
    bulletGraphics.destroy();

    const enemyBulletGraphics = this.add.graphics();
    enemyBulletGraphics.fillStyle(0xff3366);
    enemyBulletGraphics.fillCircle(3, 3, 3);
    enemyBulletGraphics.generateTexture('enemyBullet', 6, 6);
    enemyBulletGraphics.destroy();

    // Enemy graphics (placeholder) - smaller
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff3333);
    enemyGraphics.fillRect(0, 0, 22, 22);
    enemyGraphics.generateTexture('enemy', 22, 22);
    enemyGraphics.destroy();
  }

  private createUI() {
    const shipConfig = SHIPS[this.currentShipId];

    this.scoreText = this.add.text(16, 16, 'Score: 0', {
      fontSize: '20px',
      color: '#00ffff'
    });

    this.healthText = this.add.text(16, 42, `HP: ${this.health}/${shipConfig.maxHealth}`, {
      fontSize: '18px',
      color: '#00ff00'
    });

    this.armorText = this.add.text(16, 68, `Armor: ${this.armor}/${shipConfig.maxArmor}`, {
      fontSize: '18px',
      color: '#ffaa00'
    });

    this.levelText = this.add.text(this.scale.width - 16, 16, 'Level: 1', {
      fontSize: '20px',
      color: '#ffffff'
    }).setOrigin(1, 0);

    this.waveText = this.add.text(this.scale.width - 16, 42, 'Wave: 0/0', {
      fontSize: '18px',
      color: '#aaaaaa'
    }).setOrigin(1, 0);

    this.add.text(this.scale.width / 2, 16, `${shipConfig.name} - AstralSaints`, {
      fontSize: '18px',
      color: '#ffffff'
    }).setOrigin(0.5, 0);

    // Controls hint
    this.add.text(this.scale.width / 2, this.scale.height - 60, 'Arrows: Move | Space: Shoot', {
      fontSize: '12px',
      color: '#888888'
    }).setOrigin(0.5);

    this.add.text(this.scale.width / 2, this.scale.height - 40, 'A: Toggle Auto-Fire | R: Restart', {
      fontSize: '12px',
      color: '#888888'
    }).setOrigin(0.5);
  }

  private setupCollisions() {
    this.physics.add.overlap(
      this.playerBullets,
      this.enemies,
      this.hitEnemy as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
      undefined,
      this
    );

    this.physics.add.overlap(
      this.player,
      this.enemyBullets,
      this.hitPlayer as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
      undefined,
      this
    );

    this.physics.add.overlap(
      this.player,
      this.enemies,
      this.hitPlayerByEnemy as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
      undefined,
      this
    );

    // Power-up collision - set up after powerUpManager is created
    this.time.delayedCall(100, () => {
      this.physics.add.overlap(
        this.player,
        this.powerUpManager.getPowerUpGroup(),
        this.collectPowerUp as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
        undefined,
        this
      );
    });
  }

  update(time: number) {
    // Update starfield
    this.updateStarfield();

    // Update systems
    this.waveManager.update();
    this.levelManager.update();
    this.powerUpManager.update();

    // Restart on R key
    if (Phaser.Input.Keyboard.JustDown(this.rKey)) {
      this.currentLevel = 1;
      this.score = 0;
      this.scene.restart();
      return;
    }

    // Player movement - apply speed multiplier from power-ups
    const shipConfig = SHIPS[this.currentShipId];
    const speed = shipConfig.speed * this.powerUpManager.speedMultiplier;
    this.player.setVelocity(0);

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-speed);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(speed);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-speed);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(speed);
    }

    // Firing - support both auto-fire and manual, apply fire rate multiplier
    const shouldFire = this.autoFire ? true : this.spaceKey.isDown;
    const weaponConfig = WEAPON_TYPES[this.powerUpManager.currentWeapon];
    const adjustedFireRate = shipConfig.fireRate * weaponConfig.fireRate * this.powerUpManager.fireRateMultiplier;

    if (shouldFire && time > this.lastFired + adjustedFireRate) {
      this.fireBullet();
      this.lastFired = time;
    }

    // Update wave bullets
    this.playerBullets.children.each((bullet: Phaser.GameObjects.GameObject) => {
      const b = bullet as Phaser.Physics.Arcade.Sprite;
      if (b.getData('wave')) {
        const waveOffset = b.getData('waveOffset') || 0;
        const newOffset = waveOffset + 0.1;
        b.setData('waveOffset', newOffset);
        const amplitude = 40;
        b.x = b.getData('startX') + Math.sin(newOffset) * amplitude;
      }
    });

    // Clean up off-screen bullets
    this.playerBullets.children.each((bullet: Phaser.GameObjects.GameObject) => {
      const b = bullet as Phaser.Physics.Arcade.Sprite;
      if (b.y < -30) b.destroy();
    });

    this.enemyBullets.children.each((bullet: Phaser.GameObjects.GameObject) => {
      const b = bullet as Phaser.Physics.Arcade.Sprite;
      if (b.y > this.scale.height + 30) b.destroy();
    });

    // Update UI
    this.updateUI();

    // Check level complete
    if (this.levelManager.isLevelComplete() && this.enemies.countActive() === 0) {
      this.nextLevel();
    }
  }

  private fireBullet() {
    const shipConfig = SHIPS[this.currentShipId];
    const weaponConfig = WEAPON_TYPES[this.powerUpManager.currentWeapon];

    // Apply power-up multipliers
    const baseDamage = shipConfig.bulletDamage * weaponConfig.damage * this.powerUpManager.damageMultiplier;
    const bulletSpeed = shipConfig.bulletSpeed * weaponConfig.bulletSpeed;

    // Fire based on weapon pattern
    switch (weaponConfig.pattern) {
      case 'single':
        this.fireSingleBullet(bulletSpeed, baseDamage, weaponConfig.color);
        break;

      case 'triple':
        // Spread shot - 3 bullets in cone
        for (let i = -1; i <= 1; i++) {
          const angle = i * (weaponConfig.spread || 20);
          this.fireAngledBullet(angle, bulletSpeed, baseDamage, weaponConfig.color);
        }
        break;

      case 'wave':
        // Single bullet but with wave data
        const bullet = this.fireSingleBullet(bulletSpeed, baseDamage, weaponConfig.color);
        if (bullet) {
          bullet.setData('wave', true);
          bullet.setData('waveOffset', 0);
          bullet.setData('startX', this.player.x);
        }
        break;

      default:
        this.fireSingleBullet(bulletSpeed, baseDamage, weaponConfig.color);
    }
  }

  private fireSingleBullet(speed: number, damage: number, color: number): Phaser.Physics.Arcade.Sprite | null {
    const bullet = this.playerBullets.get(this.player.x, this.player.y - 25);
    if (bullet) {
      bullet.setTexture('bullet');
      bullet.setTint(color);
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.setVelocityY(-speed);
      bullet.setDisplaySize(3, 12);
      bullet.setData('damage', damage);
      return bullet as Phaser.Physics.Arcade.Sprite;
    }
    return null;
  }

  private fireAngledBullet(angleDegrees: number, speed: number, damage: number, color: number): void {
    const bullet = this.playerBullets.get(this.player.x, this.player.y - 25);
    if (bullet) {
      bullet.setTexture('bullet');
      bullet.setTint(color);
      bullet.setActive(true);
      bullet.setVisible(true);

      // Convert angle to radians and calculate velocity
      const angleRad = Phaser.Math.DegToRad(angleDegrees - 90); // -90 because 0 degrees is up
      const vx = Math.cos(angleRad) * speed;
      const vy = Math.sin(angleRad) * speed;

      bullet.setVelocity(vx, vy);
      bullet.setDisplaySize(3, 12);
      bullet.setData('damage', damage);
    }
  }

  private updateEnemyShooting() {
    const time = this.time.now;

    this.enemies.children.each((enemy: Phaser.GameObjects.GameObject) => {
      const e = enemy as Phaser.Physics.Arcade.Sprite;
      if (!e.active) return;

      const fireRate = e.getData('fireRate');
      if (!fireRate) return; // This enemy doesn't shoot

      const lastFired = e.getData('lastFired') || 0;

      if (time > lastFired + fireRate) {
        this.enemyFireBullet(e);
        e.setData('lastFired', time);
      }
    });
  }

  private enemyFireBullet(enemy: Phaser.Physics.Arcade.Sprite) {
    const enemyType = enemy.getData('type');
    const enemyConfig = ENEMY_TYPES[enemyType];

    if (!enemyConfig || !enemyConfig.bulletSpeed) return;

    const bullet = this.enemyBullets.get(enemy.x, enemy.y + 15);
    if (bullet) {
      bullet.setTexture('enemyBullet');
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.setVelocityY(enemyConfig.bulletSpeed);
      bullet.setDisplaySize(6, 6);
      bullet.setData('damage', enemyConfig.bulletDamage);
    }
  }

  private hitEnemy(
    bullet: Phaser.Types.Physics.Arcade.GameObjectWithBody,
    enemy: Phaser.Types.Physics.Arcade.GameObjectWithBody
  ) {
    bullet.destroy();

    const e = enemy as Phaser.Physics.Arcade.Sprite;
    const bulletDamage = (bullet as Phaser.Physics.Arcade.Sprite).getData('damage') || 10;
    const health = e.getData('health') - bulletDamage;
    e.setData('health', health);

    // Visual feedback - flash white
    e.setTint(0xffffff);
    this.time.delayedCall(50, () => {
      const enemyType = e.getData('type');
      const enemyConfig = ENEMY_TYPES[enemyType];
      e.setTint(enemyConfig?.color || 0xff3333);
    });

    if (health <= 0) {
      // Explosion effect (simple for now)
      const explosion = this.add.circle(e.x, e.y, 20, 0xff6600, 0.8);
      this.tweens.add({
        targets: explosion,
        alpha: 0,
        scale: 2,
        duration: 200,
        onComplete: () => explosion.destroy()
      });

      const scoreValue = e.getData('scoreValue') || 100;
      this.score += scoreValue;

      // Spawn power-up drop
      this.powerUpManager.spawnPowerUp(e.x, e.y);

      e.destroy();
    }
  }

  private collectPowerUp(
    player: Phaser.Types.Physics.Arcade.GameObjectWithBody,
    powerup: Phaser.Types.Physics.Arcade.GameObjectWithBody
  ) {
    const pickup = powerup as Phaser.Physics.Arcade.Sprite;
    const type = pickup.getData('type');

    // Handle shield power-up specially
    if (type === 'shield') {
      this.armor += 50;
      const shipConfig = SHIPS[this.currentShipId];
      if (this.armor > shipConfig.maxArmor) {
        this.armor = shipConfig.maxArmor;
      }
    }

    this.powerUpManager.collectPowerUp(pickup);
  }

  private hitPlayer(
    player: Phaser.Types.Physics.Arcade.GameObjectWithBody,
    bullet: Phaser.Types.Physics.Arcade.GameObjectWithBody
  ) {
    bullet.destroy();
    const damage = (bullet as Phaser.Physics.Arcade.Sprite).getData('damage') || 10;
    this.takeDamage(damage);
  }

  private hitPlayerByEnemy(
    player: Phaser.Types.Physics.Arcade.GameObjectWithBody,
    enemy: Phaser.Types.Physics.Arcade.GameObjectWithBody
  ) {
    enemy.destroy();
    this.takeDamage(30); // Collision damage
  }

  private takeDamage(damage: number) {
    // Armor absorbs first
    if (this.armor > 0) {
      const armorDamage = Math.min(this.armor, damage);
      this.armor -= armorDamage;
      damage -= armorDamage;
    }

    // Remaining damage to health
    if (damage > 0) {
      this.health -= damage;
    }

    // Visual feedback
    this.player.setTint(0xff0000);
    this.time.delayedCall(100, () => this.player.clearTint());

    if (this.health <= 0) {
      this.gameOver();
    }
  }

  private updateUI() {
    const shipConfig = SHIPS[this.currentShipId];
    this.scoreText.setText(`Score: ${this.score}`);
    this.healthText.setText(`HP: ${Math.max(0, Math.floor(this.health))}/${shipConfig.maxHealth}`);
    this.armorText.setText(`Armor: ${Math.max(0, Math.floor(this.armor))}/${shipConfig.maxArmor}`);
    this.levelText.setText(`Level: ${this.currentLevel}`);

    const currentWave = this.levelManager.getCurrentWaveNumber();
    const totalWaves = this.levelManager.getTotalWaves();
    this.waveText.setText(`Wave: ${currentWave}/${totalWaves}`);
  }

  private nextLevel() {
    this.currentLevel++;
    if (this.currentLevel <= 5) {
      // Start next level
      this.scene.pause();
      this.add.text(this.scale.width / 2, this.scale.height / 2, `Level ${this.currentLevel}!`, {
        fontSize: '48px',
        color: '#00ffff'
      }).setOrigin(0.5);

      this.time.delayedCall(2000, () => {
        this.scene.restart();
      });
    } else {
      // Game complete!
      this.gameComplete();
    }
  }

  private gameOver() {
    this.scene.pause();
    this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x000000, 0.7).setOrigin(0);
    this.add.text(this.scale.width / 2, this.scale.height / 2, 'GAME OVER', {
      fontSize: '64px',
      color: '#ff0000'
    }).setOrigin(0.5);

    this.add.text(this.scale.width / 2, this.scale.height / 2 + 60, `Final Score: ${this.score}`, {
      fontSize: '32px',
      color: '#ffffff'
    }).setOrigin(0.5);

    this.add.text(this.scale.width / 2, this.scale.height / 2 + 120, 'Click to restart', {
      fontSize: '24px',
      color: '#aaaaaa'
    }).setOrigin(0.5);

    this.input.once('pointerdown', () => {
      this.currentLevel = 1;
      this.score = 0;
      this.scene.restart();
    });
  }

  private gameComplete() {
    this.scene.pause();
    this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x000000, 0.7).setOrigin(0);
    this.add.text(this.scale.width / 2, this.scale.height / 2, 'VICTORY!', {
      fontSize: '64px',
      color: '#00ff00'
    }).setOrigin(0.5);

    this.add.text(this.scale.width / 2, this.scale.height / 2 + 60, `Final Score: ${this.score}`, {
      fontSize: '32px',
      color: '#ffffff'
    }).setOrigin(0.5);
  }
}
