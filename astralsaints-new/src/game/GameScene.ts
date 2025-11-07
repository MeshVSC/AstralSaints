import Phaser from 'phaser';

export class GameScene extends Phaser.Scene {
  private player?: Phaser.GameObjects.Rectangle;
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;

  constructor() {
    super('GameScene');
  }

  create() {
    // Create player ship (simple rectangle for now)
    this.player = this.add.rectangle(400, 500, 40, 40, 0x00ff00);
    this.physics.add.existing(this.player);

    // Keyboard controls
    this.cursors = this.input.keyboard?.createCursorKeys();

    // Test text
    this.add.text(400, 50, 'AstralSaints - New Build', {
      fontSize: '24px',
      color: '#fff'
    }).setOrigin(0.5);
  }

  update() {
    if (!this.player || !this.cursors) return;

    const body = this.player.body as Phaser.Physics.Arcade.Body;
    
    // Movement
    body.setVelocity(0);
    
    if (this.cursors.left?.isDown) {
      body.setVelocityX(-300);
    } else if (this.cursors.right?.isDown) {
      body.setVelocityX(300);
    }
    
    if (this.cursors.up?.isDown) {
      body.setVelocityY(-300);
    } else if (this.cursors.down?.isDown) {
      body.setVelocityY(300);
    }

    // Keep in bounds
    this.player.x = Phaser.Math.Clamp(this.player.x, 20, 780);
    this.player.y = Phaser.Math.Clamp(this.player.y, 20, 580);
  }
}
