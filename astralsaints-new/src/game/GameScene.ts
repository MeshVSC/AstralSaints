import Phaser from 'phaser';
import { Player } from './entities/Player';
import { Enemy } from './entities/Enemy';
import { ShipType } from '../core/ships';

export class GameScene extends Phaser.Scene {
  private player?: Player;
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private enemies: Enemy[] = [];
  private score: number = 0;
  private scoreText?: Phaser.GameObjects.Text;
  private healthText?: Phaser.GameObjects.Text;
  private lastEnemySpawn: number = 0;

  constructor() {
    super('GameScene');
  }

  create() {
    // Create player
    this.player = new Player(this, 400, 500, ShipType.PEGASUS);

    // Keyboard controls
    this.cursors = this.input.keyboard?.createCursorKeys();

    // UI
    this.scoreText = this.add.text(16, 16, 'Score: 0', {
      fontSize: '24px',
      color: '#fff'
    });

    this.healthText = this.add.text(16, 50, 'Health: 100', {
      fontSize: '24px',
      color: '#fff'
    });

    this.add.text(400, 16, 'AstralSaints - Arrow Keys to Move', {
      fontSize: '20px',
      color: '#fff'
    }).setOrigin(0.5);
  }

  update(time: number) {
    if (!this.player || !this.cursors) return;

    // Update player
    this.player.update(this.cursors, time);

    // Spawn enemies
    if (time > this.lastEnemySpawn + 1000) {
      this.spawnEnemy();
      this.lastEnemySpawn = time;
    }

    // Update enemies
    this.enemies.forEach((enemy, index) => {
      enemy.update();

      // Check collision with player bullets
      this.player!.bullets.children.entries.forEach((bullet) => {
        const bulletSprite = bullet as Phaser.GameObjects.Rectangle;
        if (this.checkCollision(bulletSprite, enemy.sprite)) {
          bulletSprite.destroy();
          if (enemy.takeDamage(10)) {
            this.enemies.splice(index, 1);
            this.score += 100;
            this.scoreText?.setText(`Score: ${this.score}`);
          }
        }
      });
    });

    // Update health display
    this.healthText?.setText(`Health: ${this.player.health}`);

    // Clean up off-screen bullets
    this.player.bullets.children.entries.forEach((bullet) => {
      if ((bullet as any).y < -20) {
        bullet.destroy();
      }
    });
  }

  private spawnEnemy() {
    const x = Phaser.Math.Between(50, 750);
    const enemy = new Enemy(this, x, -30);
    this.enemies.push(enemy);
  }

  private checkCollision(a: Phaser.GameObjects.Rectangle, b: Phaser.GameObjects.Rectangle): boolean {
    const boundsA = a.getBounds();
    const boundsB = b.getBounds();
    return Phaser.Geom.Intersects.RectangleToRectangle(boundsA, boundsB);
  }
}
