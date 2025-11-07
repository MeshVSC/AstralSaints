import Phaser from 'phaser';
import { ShipType, SHIP_DATA, WeaponType } from '../../core/ships';

export class Player {
  public sprite: Phaser.GameObjects.Rectangle;
  public health: number;
  private scene: Phaser.Scene;
  private shipType: ShipType;
  private lastFired: number = 0;
  private fireRate: number;
  public bullets: Phaser.Physics.Arcade.Group;

  constructor(scene: Phaser.Scene, x: number, y: number, shipType: ShipType = ShipType.PEGASUS) {
    this.scene = scene;
    this.shipType = shipType;
    
    const stats = SHIP_DATA[shipType];
    this.health = stats.health;
    this.fireRate = stats.fireRate;

    this.sprite = scene.add.rectangle(x, y, 40, 40, 0x00ff00);
    scene.physics.add.existing(this.sprite);
    
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.setCollideWorldBounds(true);

    this.bullets = scene.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 50
    });
  }

  update(cursors: Phaser.Types.Input.Keyboard.CursorKeys, time: number) {
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    const stats = SHIP_DATA[this.shipType];

    body.setVelocity(0);
    
    if (cursors.left?.isDown) {
      body.setVelocityX(-stats.speed);
    } else if (cursors.right?.isDown) {
      body.setVelocityX(stats.speed);
    }
    
    if (cursors.up?.isDown) {
      body.setVelocityY(-stats.speed);
    } else if (cursors.down?.isDown) {
      body.setVelocityY(stats.speed);
    }

    if (time > this.lastFired + this.fireRate) {
      this.fire();
      this.lastFired = time;
    }
  }

  private fire() {
    const bullet = this.scene.add.rectangle(
      this.sprite.x,
      this.sprite.y - 20,
      4,
      12,
      0x00ffff
    );
    
    this.scene.physics.add.existing(bullet);
    const body = bullet.body as Phaser.Physics.Arcade.Body;
    body.setVelocityY(-400);
    
    this.bullets.add(bullet);
  }

  takeDamage(amount: number) {
    this.health -= amount;
    if (this.health <= 0) {
      this.health = 0;
    }
  }
}
