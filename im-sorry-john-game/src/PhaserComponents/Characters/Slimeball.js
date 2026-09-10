import Phaser from "phaser";
import { johnTakeDmg } from "../Functions/johnTakeDmg";

export default class Slimeball extends Phaser.Physics.Arcade.Sprite {
  health = 10;
  damage = 1;
  static speed = 100;

  constructor(scene, x, y, key) {
    super(scene, x, y, key);

    scene.add.existing(this); // adds to display list
    scene.physics.add.existing(this); // adds in physics
    this.setScale(1.3);
    this.setCircle(7, 9, 12);
    this.chasing = true;
    this.anims.play("sb-idle");
  }

  updateMovement(john) {
    if (!this.chasing || !this.body?.enable) {
      return;
    }

    const dx = john.x - this.x;
    const dy = john.y - this.y;
    const distance = Math.hypot(dx, dy) || 1;

    this.setVelocity(
      (dx / distance) * Slimeball.speed,
      (dy / distance) * Slimeball.speed
    );
  }

  takeDmg(slime, dmg, scene, dir) {
    slime.health -= dmg;
    slime.chasing = false;
    slime.setVelocity(dir.x, dir.y);
    slime.setTint(0xff0000);

    scene.time.addEvent({
      delay: 100,
      callback: () => {
        if (slime.active) {
          slime.clearTint();
          slime.chasing = true;
        }
      },
    });

    if (slime.health <= 0) {
      slime.disableBody(true, true);
      // Don't remove from group - just disable it to avoid collision errors
      // The wave completion check will count disabled enemies as "killed"
    }
  }

  handleTouchPlayer(scene) {
    const dx = this.scene.john.x - this.x;
    const dy = this.scene.john.y - this.y;
    const distance = Math.hypot(dx, dy) || 1;
    const dir = {
      x: (dx / distance) * 200,
      y: (dy / distance) * 200,
    };

    johnTakeDmg(scene, this.damage, dir);
  }

  preUpdate(t, dt) {
    super.preUpdate(t, dt);
  }
}
