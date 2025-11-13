import Phaser from 'phaser';
import { WaveManager } from '../systems/WaveManager';
import { LevelManager } from '../systems/LevelManager';
import { SHIPS, DEFAULT_SHIP } from '../../config/ships';
import { ENEMY_TYPES } from '../../config/enemies';

export default class GameScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private playerBullets!: Phaser.Physics.Arcade.Group;
  private enemies!: Phaser.Physics.Arcade.Group;
  private enemyBullets!: Phaser.Physics.Arcade.Group;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private spaceKey!: Phaser.Input.Keyboard.Key;

  // Game state
  private score: number = 0;
  private health: number = 100;
  private armor: number = 50;
  private lastFired: number = 0;
  private currentShipId: string = DEFAULT_SHIP;

  // UI
  private scoreText!: Phaser.GameObjects.Text;
  private healthText!: Phaser.GameObjects.Text;
  private armorText!: Phaser.GameObjects.Text;
  private levelText!: Phaser.GameObjects.Text;
  private waveText!: Phaser.GameObjects.Text;

  // Systems
  private waveManager!: WaveManager;
  private levelManager!: LevelManager;
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

    // Player
    this.player = this.physics.add.sprite(400, 500, '');
    this.player.setDisplaySize(shipConfig.size.width, shipConfig.size.height);
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00);
    playerGraphics.fillTriangle(20, 0, 0, 40, 40, 40); // Triangle ship
    playerGraphics.generateTexture('player', 40, 40);
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

    // UI
    this.createUI();

    // Collisions
    this.setupCollisions();

    // Initialize systems
    this.waveManager = new WaveManager(this, this.enemies);
    this.levelManager = new LevelManager(this, this.waveManager);

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
    // Bullet graphics
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0x00ffff);
    bulletGraphics.fillRect(0, 0, 4, 16); // Longer bullets
    bulletGraphics.generateTexture('bullet', 4, 16);
    bulletGraphics.destroy();

    const enemyBulletGraphics = this.add.graphics();
    enemyBulletGraphics.fillStyle(0xff3366);
    enemyBulletGraphics.fillCircle(4, 4, 4);
    enemyBulletGraphics.generateTexture('enemyBullet', 8, 8);
    enemyBulletGraphics.destroy();

    // Enemy graphics (placeholder)
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff3333);
    enemyGraphics.fillRect(0, 0, 30, 30);
    enemyGraphics.generateTexture('enemy', 30, 30);
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
      fontSize: '20px',
      color: '#ffffff'
    }).setOrigin(0.5, 0);
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
  }

  update(time: number) {
    // Update starfield
    this.updateStarfield();

    // Update systems
    this.waveManager.update();
    this.levelManager.update();

    // Player movement - MUCH FASTER
    const shipConfig = SHIPS[this.currentShipId];
    const speed = shipConfig.speed;
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

    // Firing - FASTER
    if (this.spaceKey.isDown && time > this.lastFired + shipConfig.fireRate) {
      this.fireBullet();
      this.lastFired = time;
    }

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
    const bullet = this.playerBullets.get(this.player.x, this.player.y - 30);
    if (bullet) {
      bullet.setTexture('bullet');
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.setVelocityY(-shipConfig.bulletSpeed); // MUCH FASTER
      bullet.setDisplaySize(4, 16);
      bullet.setData('damage', shipConfig.bulletDamage);
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

    const bullet = this.enemyBullets.get(enemy.x, enemy.y + 20);
    if (bullet) {
      bullet.setTexture('enemyBullet');
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.setVelocityY(enemyConfig.bulletSpeed);
      bullet.setDisplaySize(8, 8);
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
      e.destroy();
    }
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
