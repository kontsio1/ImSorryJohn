import Phaser from "phaser";
import { Level1 } from "../Scenes/Level1";

export default class Slimeball extends Phaser.Physics.Arcade.Sprite
{
    constructor(scene, x, y, texture, frame)
    {
        super(scene, x, y, texture, frame)

        this.setScale(1.3)
        scene.physics.add.collider(scene.john, this, this.handleTouchPlayer)
        scene.physics.add.collider(scene.walls_layer, this, this.handleWallCollision)
        this.anims.play('sb-idle')

    }
    handleWallCollision() {
        console.log('woaah')
    }
    handleTouchPlayer() {

    }
    preUpdate(t,dt)
    {
        super.preUpdate(t, dt)

        const speed = 10
        const awayFromJohn = {relativeX: this.scene.john.x-this.x, relativeY: this.scene.john.y-this.y}
        this.setVelocity(awayFromJohn.relativeX, awayFromJohn.relativeY)
        console.log(awayFromJohn)
    }
}