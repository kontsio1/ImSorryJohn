import Phaser from "phaser";
import { johnTakeDmg } from "../Functions/johnTakeDmg";

export default class John extends Phaser.Physics.Arcade.Sprite {
  speed = 250;
  maxHp = 5;
  activeHp = this.maxHp;

  constructor(scene, x, y, key, frame) {
    super(scene, x, y);
    scene.physics.add.existing(this);
    scene.add.existing(this);
    this.anims.play("john-idle", true);
    this.setScale(0.25);
    this.setBodySize(100, 290);
    this.isIdle = true;
    this.isDead = false;
  }

  setFireballs(fireballs) {
    this.fireballs = fireballs;
  }

  throwFireball(dir) {
    const fireball = this.fireballs.get(this.x, this.y, "fireball");
    if (!fireball) {
      console.log("out of fireballs");
      return;
    } else {
      fireball.body.setCircle(10,0,6);
      fireball.setActive(true);
      fireball.setVisible(true);

    switch(dir){
        case "up":
            fireball.setVelocity(0, -450);
            fireball.anims.play("fireball-travelling", true)
            fireball.rotation = 1.5708
            fireball.body.offset.y = 0 /*leave zero bug(?)*/
            fireball.body.offset.x = 6.5
            break;
        case "down":
            fireball.setVelocity(0, 450);
            fireball.anims.play("fireball-travelling", true)
            fireball.rotation = -1.5708
            fireball.body.offset.y = 12
            fireball.body.offset.x = 6.5
            break;
        case "left":
            fireball.setVelocity(-450, 0);
            fireball.anims.play("fireball-travelling", true)
            break;
        case "right":
            fireball.setVelocity(450, 0);
            fireball.anims.play("fireball-travelling", true)
            fireball.scaleX = -1
            fireball.body.offset.x = 20
            break;
        default:
            // fireball.setVelocity(0, -450);
            fireball.anims.play("fireball-travelling", true)
    }
}
  }

  checkIfDead() {
    if (this.activeHp <= 0) {
      this.isDead = true;
      this.isIdle = true;
    }
  }

  update(controls) {
    if (this.isDead) {
      this.setVelocity(0, 0);
      this.setTint("0x0000");
      //play death animation
    }
    if (this.isIdle && !this.isDead) {
      if (controls.right?.isDown) {
        this.setVelocity(this.speed, 0);
        this.anims.play("john-walk-east", true);
      } else if (controls.left?.isDown) {
        this.setVelocity(-this.speed, 0);
        this.anims.play("john-walk-west", true);
      } else if (controls.up?.isDown) {
        this.setVelocity(0, -this.speed);
        this.anims.play("john-walk-up", true);
      } else if (controls.down?.isDown) {
        this.setVelocity(0, this.speed);
        this.anims.play("john-walk-down", true);
      } else if (this.isIdle) {
        this.setVelocity(0, 0);
        this.anims.play("john-idle", true);
      }
      if (Phaser.Input.Keyboard.JustDown(controls.jump)) {
        this.setVelocity(0, 0);
        this.isIdle = false;
        this.anims.play("john-tp-out", true);
        this.scene.time.addEvent({
          delay: 800,
          callback: () => {
            if (controls.right.isDown) {
              this.setPosition(this.x + 200, this.y);
            }
            if (controls.left.isDown) {
              this.setPosition(this.x - 200, this.y);
            }
            if (controls.up.isDown) {
              this.setPosition(this.x, this.y - 200);
            }
            if (controls.down.isDown) {
              this.setPosition(this.x, this.y + 200);
            }
            this.anims.play("john-tp-in");
            this.once("animationcomplete", () => {
              this.isIdle = true;
            });
          },
        });
      }
      if (Phaser.Input.Keyboard.JustDown(controls.throwUp)) {
        this.throwFireball("up");
      }
      if (Phaser.Input.Keyboard.JustDown(controls.throwDown)) {
        this.throwFireball("down");
      }
      if (Phaser.Input.Keyboard.JustDown(controls.throwLeft)) {
        this.throwFireball("left");
      }
      if (Phaser.Input.Keyboard.JustDown(controls.throwRight)) {
        this.throwFireball("right");
      }
    }
  }
}
