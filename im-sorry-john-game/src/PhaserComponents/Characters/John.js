import Phaser from "phaser";

const BASE_FIREBALL_DAMAGE = 5;
const BONUS_FIREBALL_DAMAGE = 40;
const MAX_CHARGE_MS = 2200;
const BASE_HITBOX_RADIUS = 10;
const BONUS_HITBOX_RADIUS = 12;
const MIN_FIREBALL_SCALE = 1;
const MAX_FIREBALL_SCALE = 5.2;

const CHARGE_BAR_WIDTH = 52;
const CHARGE_BAR_HEIGHT = 6;
const CHARGE_BAR_FOOT_GAP = 5;

export default class John extends Phaser.Physics.Arcade.Sprite {
  speed = 250;
  maxHp = 5;
  activeHp = this.maxHp;

  constructor(scene, x, y, key, frame) {
    super(scene, x, y, key, frame);
    scene.physics.add.existing(this);
    scene.add.existing(this);

    this.anims.play("john-idle", true);
    this.setScale(0.25);
    this.setBodySize(100, 290);

    this.isIdle = true;
    this.isDead = false;

    this.chargeDirection = null;
    this.chargeTimeMs = 0;

    this.createChargeIndicator();
    this.once("destroy", () => this.destroyChargeIndicator());
  }

  setFireballs(fireballs) {
    this.fireballs = fireballs;
  }

  createChargeIndicator() {
    this.chargeBarBg = this.scene.add
      .rectangle(0, 0, CHARGE_BAR_WIDTH, CHARGE_BAR_HEIGHT, 0x330000, 0.8)
      .setScrollFactor(0)
      .setOrigin(0.5)
      .setVisible(false)
      .setDepth(200);

    this.chargeBarFill = this.scene.add
      .rectangle(0, 0, 0, CHARGE_BAR_HEIGHT - 2, 0xff0000, 1)
      .setScrollFactor(0)
      .setOrigin(0, 0.5)
      .setVisible(false)
      .setDepth(201);

    this.lastChargeBarX = Number.NaN;
    this.lastChargeBarY = Number.NaN;
    this.lastChargeFillWidth = -1;
  }

  destroyChargeIndicator() {
    this.chargeBarBg?.destroy();
    this.chargeBarFill?.destroy();
    this.chargeBarBg = null;
    this.chargeBarFill = null;
  }

  updateChargeIndicator() {
    if (!this.chargeBarBg || !this.chargeBarFill) {
      return;
    }

    if (!this.chargeDirection || this.isDead) {
      this.chargeBarBg.setVisible(false);
      this.chargeBarFill.setVisible(false);
      this.chargeBarFill.width = 0;
      this.lastChargeFillWidth = 0;
      return;
    }

    const ratio = Phaser.Math.Clamp(this.chargeTimeMs / MAX_CHARGE_MS, 0, 1);
    const camera = this.scene.cameras.main;

    const feetWorldY = this.y + this.displayHeight * 0.5;
    const projectedCenterX = (this.x - camera.worldView.x) * camera.zoom + camera.x;
    const projectedCenterY =
      (feetWorldY - camera.worldView.y) * camera.zoom + camera.y + CHARGE_BAR_FOOT_GAP;

    const snappedCenterX = Math.round(projectedCenterX);
    const snappedCenterY = Math.round(projectedCenterY);
    const fillWidth = Math.round(CHARGE_BAR_WIDTH * ratio);
    const leftX = snappedCenterX - Math.floor(CHARGE_BAR_WIDTH / 2);

    this.chargeBarBg.setVisible(true);
    this.chargeBarFill.setVisible(true);

    // Pixel-snapping + change-only writes reduce jitter from camera smoothing.
    if (snappedCenterX !== this.lastChargeBarX || snappedCenterY !== this.lastChargeBarY) {
      this.chargeBarBg.setPosition(snappedCenterX, snappedCenterY);
      this.chargeBarFill.setPosition(leftX, snappedCenterY);
      this.lastChargeBarX = snappedCenterX;
      this.lastChargeBarY = snappedCenterY;
    }

    if (fillWidth !== this.lastChargeFillWidth) {
      this.chargeBarFill.width = fillWidth;
      this.lastChargeFillWidth = fillWidth;
    }
  }

  playIfChanged(key) {
    if (this.anims.currentAnim?.key !== key) {
      this.anims.play(key, true);
    }
  }

  getThrowControl(controls, direction) {
    switch (direction) {
      case "up":
        return controls.throwUp;
      case "down":
        return controls.throwDown;
      case "left":
        return controls.throwLeft;
      case "right":
        return controls.throwRight;
      default:
        return null;
    }
  }

  getHeldThrowDirection(controls) {
    if (controls.throwUp?.isDown) return "up";
    if (controls.throwDown?.isDown) return "down";
    if (controls.throwLeft?.isDown) return "left";
    if (controls.throwRight?.isDown) return "right";
    return null;
  }

  throwFireball(direction, options = {}) {
    const damage = options.damage ?? BASE_FIREBALL_DAMAGE;
    const fireballScale = options.fireballScale ?? MIN_FIREBALL_SCALE;
    const hitboxRadius = options.hitboxRadius ?? BASE_HITBOX_RADIUS;

    const fireball = this.fireballs.get(this.x, this.y, "fireball");
    if (!fireball) {
      return;
    }

    fireball.enableBody(true, this.x, this.y, true, true);
    fireball.body.reset(this.x, this.y);
    fireball.body.setCircle(hitboxRadius, 0, 6);

    fireball.setActive(true);
    fireball.setVisible(true);
    fireball.setRotation(0);
    fireball.setFlipX(false);
    fireball.setScale(fireballScale);
    fireball.body.offset.x = 0;
    fireball.body.offset.y = 6;
    fireball.setData("damage", damage);

    fireball.anims.play("fireball-travelling", true);

    switch (direction) {
      case "up":
        fireball.setVelocity(0, -450);
        fireball.rotation = 1.5708;
        fireball.body.offset.y = 0;
        fireball.body.offset.x = 6.5;
        break;
      case "down":
        fireball.setVelocity(0, 450);
        fireball.rotation = -1.5708;
        fireball.body.offset.y = 12;
        fireball.body.offset.x = 6.5;
        break;
      case "left":
        fireball.setVelocity(-450, 0);
        break;
      case "right":
        fireball.setVelocity(450, 0);
        fireball.setFlipX(true);
        fireball.body.offset.x = 20;
        break;
      default:
        fireball.setVelocity(0, 0);
    }
  }

  releaseChargedFireball(direction) {
    const linearCharge = Phaser.Math.Clamp(this.chargeTimeMs / MAX_CHARGE_MS, 0, 1);
    const damageCurve = Math.pow(linearCharge, 2.5);
    const sizeCurve = Math.pow(linearCharge, 2.15);

    const damage = Math.round(BASE_FIREBALL_DAMAGE + BONUS_FIREBALL_DAMAGE * damageCurve);
    const fireballScale = Phaser.Math.Linear(MIN_FIREBALL_SCALE, MAX_FIREBALL_SCALE, sizeCurve);
    const hitboxRadius = Math.round(BASE_HITBOX_RADIUS + BONUS_HITBOX_RADIUS * sizeCurve);

    this.throwFireball(direction, {
      damage,
      fireballScale,
      hitboxRadius,
    });

    this.chargeDirection = null;
    this.chargeTimeMs = 0;
  }

  updateChargeAndFire(controls, dt) {
    if (!this.chargeDirection) {
      const heldDirection = this.getHeldThrowDirection(controls);
      if (heldDirection) {
        this.chargeDirection = heldDirection;
        this.chargeTimeMs = 0;
      }
      return;
    }

    const activeControl = this.getThrowControl(controls, this.chargeDirection);
    if (activeControl?.isDown) {
      this.chargeTimeMs = Math.min(this.chargeTimeMs + dt, MAX_CHARGE_MS);
      return;
    }

    this.releaseChargedFireball(this.chargeDirection);
  }

  checkIfDead() {
    if (this.activeHp <= 0 && !this.isDead) {
      this.isDead = true;
      this.isIdle = true;
      this.chargeDirection = null;
      this.chargeTimeMs = 0;

      if (this.scene?.showGameOver) {
        this.scene.time.delayedCall(500, () => {
          this.scene.showGameOver();
        });
      }
    }
  }

  update(controls, dt = 16) {
    if (this.isDead) {
      this.setVelocity(0, 0);
      this.setTint("0x0000");
      this.updateChargeIndicator();
      return;
    }

    if (this.isIdle) {
      let velocityX = 0;
      let velocityY = 0;
      let nextAnimation = "john-idle";

      if (controls.right?.isDown) {
        velocityX = this.speed;
        nextAnimation = "john-walk-east";
      } else if (controls.left?.isDown) {
        velocityX = -this.speed;
        nextAnimation = "john-walk-west";
      } else if (controls.up?.isDown) {
        velocityY = -this.speed;
        nextAnimation = "john-walk-up";
      } else if (controls.down?.isDown) {
        velocityY = this.speed;
        nextAnimation = "john-walk-down";
      }

      this.setVelocity(velocityX, velocityY);
      this.playIfChanged(nextAnimation);

      if (Phaser.Input.Keyboard.JustDown(controls.jump)) {
        this.setVelocity(0, 0);
        this.isIdle = false;
        this.anims.play("john-tp-out", true);

        this.scene.time.addEvent({
          delay: 800,
          callback: () => {
            if (controls.right.isDown) this.setPosition(this.x + 200, this.y);
            if (controls.left.isDown) this.setPosition(this.x - 200, this.y);
            if (controls.up.isDown) this.setPosition(this.x, this.y - 200);
            if (controls.down.isDown) this.setPosition(this.x, this.y + 200);

            this.anims.play("john-tp-in");
            this.once("animationcomplete", () => {
              this.isIdle = true;
            });
          },
        });
      }

      this.updateChargeAndFire(controls, dt);
    }

    this.updateChargeIndicator();
  }
}
