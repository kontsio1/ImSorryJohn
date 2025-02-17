import Phaser, { Geom, Math, Scene } from "phaser";
import { Level1 } from "../Scenes/Level1";
import { johnTakeDmg } from "../Functions/johnTakeDmg";

export default class Slimeball extends Phaser.Physics.Arcade.Sprite {
  health = 10;
  damage = 1;
  static speed = 100;

  constructor(scene, x, y, key) {
    super(scene, x, y);

    scene.add.existing(this); // adds to display list
    scene.physics.add.existing(this); // adds in physics
    this.setScale(1.3);
    this.setCircle(7, 9, 12);
    this.chasing = true;

    scene.physics.add.collider(scene.enemies);
    scene.physics.add.collider(scene.john, this, () => {
      this.handleTouchPlayer(scene);
    });
    scene.physics.add.collider(
      scene.walls_layer,
      this,
      this.handleWallCollision
    );
    // scene.physics.add.collider(scene.fireballs, this, this.handleWallCollision)
    this.anims.play("sb-idle");
  }

  static spacing(oneSlime, otherSlime) {
    if (oneSlime !== undefined && otherSlime !== undefined) {
      const p1 = new Geom.Point(oneSlime.x, oneSlime.y);
      const p2 = new Geom.Point(otherSlime.x, otherSlime.y);
      const distance = Math.Distance.BetweenPoints(p1, p2);
      return distance;
    }
  }

  takeDmg(slime, dmg, scene, dir) {
    slime.health -= dmg;
    slime.chasing = false;
    slime.setVelocity(dir.x, dir.y);
    slime.setTint(0xff0000);

    scene.time.addEvent({
      delay: 100,
      callback: () => {
        slime.clearTint();
        slime.chasing = true;
      },
    });

    if (slime.health <= 0) {
      slime.disableBody(true, true)
      slime.body.destroy();
    }
  }

  handleWallCollision() {
    console.log("take wall");
  }
  handleTouchPlayer(scene) {
    const dx = this.scene.john.x - this.x;
    const dy = this.scene.john.y - this.y;

    const dir = new Phaser.Math.Vector2(dx, dy).normalize().scale(200);

    johnTakeDmg(scene, 1, dir);
  }

  preUpdate(t, dt) {
    super.preUpdate(t, dt);

    // chase player
    if (this.chasing) {
      const farFromJohn = {
        dx: this.scene.john.x - this.x,
        dy: this.scene.john.y - this.y,
      };
      const pointingAtJohn = new Phaser.Math.Vector2(
        farFromJohn.dx,
        farFromJohn.dy
      )
        .normalize()
        .scale(Slimeball.speed);
      this.setVelocity(pointingAtJohn.x, pointingAtJohn.y);
    }
    // pathing
    const slimesArr = this.scene.enemies.getChildren();
    let slimes = {};
    const closestFirstArr = slimesArr.map((slime, index) => {
      slimes[slime.name] = slime;
      return [slime.name, Slimeball.spacing(slime, this.scene.john)];
    });
    closestFirstArr.sort((a, b) => a[1] - b[1]); //[[name1, johnDistance],[...]]

    closestFirstArr.map((slimeArr, index) => {
      let thisSlime = slimes[slimeArr[0]];
      let nextSlime = undefined;
      if (closestFirstArr[index + 1] !== undefined) {
        nextSlime = slimes[closestFirstArr[index + 1][0]];
      }
      const ds = Slimeball.spacing(thisSlime, nextSlime);
      if (ds < 100) {
        const relativeAngleInX =
          thisSlime.body.velocity.angle() - nextSlime.body.velocity.angle();
        if (relativeAngleInX >= 0) nextSlime.body.velocity.rotate(0.35);
        else nextSlime.body.velocity.rotate(-0.35);
      }
    });
  }
}
