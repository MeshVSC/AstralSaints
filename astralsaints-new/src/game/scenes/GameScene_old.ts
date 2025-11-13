import Phaser from 'phaser';

export default class GameScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private playerBullets!: Phaser.Physics.Arcade.Group;
  private enemies!: Phaser.Physics.Arcade.Group;
  private enemyBullets!: Phaser.Physics.Arcade.Group;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private spaceKey!: Phaser.Input.Keyboard.Key;
  private score: number = 0;
  private scoreText!: Phaser.GameObjects.Text;
  private health: number = 100;
  private healthText!: Phaser.GameObjects.Text;
  private lastFired: number = 0;
  private fireRate: number = 200;

  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    // Player
    this.player = this.physics.add.sprite(400, 500, '');
    this.player.setDisplaySize(40, 40);
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00);
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();
    this.player.setTexture('player');
    this.player.setCollideWorldBounds(true);

    // Bullet groups
    this.playerBullets = this.physics.add.group({
      classType: Phaser.Physics.Arcade.Sprite,
      maxSize: 50,
      runChildUpdate: true
    });

    this.enemies = this.physics.add.group();
    this.enemyBullets = this.physics.add.group({
      classType: Phaser.Physics.Arcade.Sprite,
      maxSize: 100
    });

    // Enemy graphics
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff0000);
    enemyGraphics.fillRect(0, 0, 30, 30);
    enemyGraphics.generateTexture('enemy', 30, 30);
    enemyGraphics.destroy();

    // Bullet graphics
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0x00ffff);
    bulletGraphics.fillRect(0, 0, 4, 12);
    bulletGraphics.generateTexture('bullet', 4, 12);
    bulletGraphics.destroy();

    const enemyBulletGraphics = this.add.graphics();
    enemyBulletGraphics.fillStyle(0xff00ff);
    enemyBulletGraphics.fillRect(0, 0, 6, 6);
    enemyBulletGraphics.generateTexture('enemyBullet', 6, 6);
    enemyBulletGraphics.destroy();

    // Controls
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // UI
    this.scoreText = this.add.text(16, 16, 'Score: 0', {
      fontSize: '24px',
      color: '#fff'
    });

    this.healthText = this.add.text(16, 50, 'Health: 100', {
      fontSize: '24px',
      color: '#fff'
    });

    this.add.text(400, 16, 'AstralSaints - Arrows Move, Space Fires', {
      fontSize: '18px',
      color: '#fff'
    }).setOrigin(0.5);

    // Collisions
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

    // Spawn enemies
    this.time.addEvent({
      delay: 1000,
      callback: this.spawnEnemy,
      callbackScope: this,
      loop: true
    });
  }

  update(time: number) {
    // Player movement
    const speed = 300;
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

    // Firing
    if (this.spaceKey.isDown && time > this.lastFired + this.fireRate) {
      this.fireBullet();
      this.lastFired = time;
    }

    // Clean up off-screen bullets
    this.playerBullets.children.each((bullet: Phaser.GameObjects.GameObject) => {
      const b = bullet as Phaser.Physics.Arcade.Sprite;
      if (b.y < -20) {
        b.destroy();
      }
    });

    this.enemyBullets.children.each((bullet: Phaser.GameObjects.GameObject) => {
      const b = bullet as Phaser.Physics.Arcade.Sprite;
      if (b.y > 620) {
        b.destroy();
      }
    });

    // Clean up off-screen enemies
    this.enemies.children.each((enemy: Phaser.GameObjects.GameObject) => {
      const e = enemy as Phaser.Physics.Arcade.Sprite;
      if (e.y > 620) {
        e.destroy();
      }
    });

    // Enemy shooting
    this.enemies.children.each((enemy: Phaser.GameObjects.GameObject) => {
      const e = enemy as Phaser.Physics.Arcade.Sprite;
      if (e.getData('lastFired') === undefined) {
        e.setData('lastFired', 0);
      }
      
      if (time > e.getData('lastFired') + 2000) {
        this.enemyFireBullet(e);
        e.setData('lastFired', time);
      }
    });
  }

  private fireBullet() {
    const bullet = this.playerBullets.get(this.player.x, this.player.y - 20);
    if (bullet) {
      bullet.setTexture('bullet');
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.setVelocityY(-400);
      bullet.setDisplaySize(4, 12);
    }
  }

  private enemyFireBullet(enemy: Phaser.Physics.Arcade.Sprite) {
    const bullet = this.enemyBullets.get(enemy.x, enemy.y + 20);
    if (bullet) {
      bullet.setTexture('enemyBullet');
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.setVelocityY(200);
      bullet.setDisplaySize(6, 6);
    }
  }

  private spawnEnemy() {
    const x = Phaser.Math.Between(50, 750);
    const enemy = this.enemies.create(x, -30, 'enemy');
    enemy.setVelocityY(100);
    enemy.setData('health', 30);
  }

  private hitEnemy(
    bullet: Phaser.Types.Physics.Arcade.GameObjectWithBody,
    enemy: Phaser.Types.Physics.Arcade.GameObjectWithBody
  ) {
    bullet.destroy();
    
    const e = enemy as Phaser.Physics.Arcade.Sprite;
    const health = e.getData('health') - 10;
    e.setData('health', health);

    if (health <= 0) {
      e.destroy();
      this.score += 100;
      this.scoreText.setText(`Score: ${this.score}`);
    }
  }

  private hitPlayer(
    player: Phaser.Types.Physics.Arcade.GameObjectWithBody,
    bullet: Phaser.Types.Physics.Arcade.GameObjectWithBody
  ) {
    bullet.destroy();
    this.health -= 10;
    this.healthText.setText(`Health: ${this.health}`);

    if (this.health <= 0) {
      this.scene.restart();
      this.health = 100;
      this.score = 0;
    }
  }

  private hitPlayerByEnemy(
    player: Phaser.Types.Physics.Arcade.GameObjectWithBody,
    enemy: Phaser.Types.Physics.Arcade.GameObjectWithBody
  ) {
    enemy.destroy();
    this.health -= 25;
    this.healthText.setText(`Health: ${this.health}`);

    if (this.health <= 0) {
      this.scene.restart();
      this.health = 100;
      this.score = 0;
    }
  }
}
