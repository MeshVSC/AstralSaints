import Phaser from 'phaser';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    // Preload assets here (for now using graphics)
  }

  create() {
    this.scene.start('GameScene');
  }
}
