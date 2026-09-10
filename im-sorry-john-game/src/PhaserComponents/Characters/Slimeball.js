import Phaser from "phaser";
import { johnTakeDmg } from "../Functions/johnTakeDmg";

function scaleTint(rgb, factor) {
  const r = Math.min(255, Math.max(0, Math.round(((rgb >> 16) & 0xff) * factor)));
  const g = Math.min(255, Math.max(0, Math.round(((rgb >> 8) & 0xff) * factor)));
  const b = Math.min(255, Math.max(0, Math.round((rgb & 0xff) * factor)));
  return (r << 16) | (g << 8) | b;
}

export default class Slimeball extends Phaser.Physics.Arcade.Sprite {
  health = 10;
  damage = 1;
  speed = 100;
  scoreValue = 100;
  variantType = "regular";

  constructor(scene, x, y, key, stats = {}) {
    super(scene, x, y, key);

    scene.add.existing(this); // adds to display list
    scene.physics.add.existing(this); // adds in physics
    this.variantType = stats.type ?? "regular";
    this.variantTint = stats.tint ?? null;
    this.health = stats.health ?? this.health;
    this.damage = stats.damage ?? this.damage;
    this.speed = stats.speed ?? this.speed;
    this.scoreValue = stats.score ?? this.scoreValue;

    this.setScale(stats.scale ?? 1.3);
    this.applyVariantAccent();

    this.setCircle(7, 9, 12);
    this.chasing = true;
    this.anims.play("sb-idle");
  }

  applyVariantAccent() {
    if (!this.variantTint) {
      this.clearTint();
      return;
    }

    // Subtle 2-tone accent: brighter on top, slightly darker on bottom.
    const bright = scaleTint(this.variantTint, 1.08);
    const dark = scaleTint(this.variantTint, 0.84);
    this.setTint(bright, bright, dark, dark);
  }

  updateMovement(john) {
    if (!this.chasing || !this.body?.enable) {
      return;
    }

    const dx = john.x - this.x;
    const dy = john.y - this.y;
    const distance = Math.hypot(dx, dy) || 1;

    this.setVelocity(
      (dx / distance) * this.speed,
      (dy / distance) * this.speed
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
          slime.applyVariantAccent();
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
