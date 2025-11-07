import Phaser from 'phaser';

export class Enemy {
  public sprite: Phaser.GameObjects.Rectangle;
  public health: number;
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene, x: number, y: number, health: number = 30) {
    this.scene = scene;
    this.health = health;

    this.sprite = scene.add.rectangle(x, y, 30, 30, 0xff0000);
    scene.physics.add.existing(this.sprite);
    
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.setVelocityY(100);
  }

  update() {
    if (this.sprite.y > 650) {
      this.destroy();
    }
  }

  takeDamage(amount: number) {
    this.health -= amount;
    if (this.health <= 0) {
      this.destroy();
      return true;
    }
    return false;
  }

  destroy() {
    this.sprite.destroy();
  }
}
