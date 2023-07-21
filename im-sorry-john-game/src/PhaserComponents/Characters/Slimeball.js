import Phaser, { Scene } from "phaser";
import { Level1 } from "../Scenes/Level1";

export default class Slimeball extends Phaser.Physics.Arcade.Sprite
{
    constructor(scene, x, y, key)
    {
        super(scene, x, y)

        scene.add.existing(this) // adds to display list
        scene.physics.add.existing(this) // adds in physics
        console.log(this)
        this.setScale(1.3)
        this.setCircle(7, 9, 12)

        scene.physics.add.collider(scene.enemies)
        scene.physics.add.collider(scene.john, this, this.handleTouchPlayer)
        scene.physics.add.collider(scene.walls_layer, this, this.handleWallCollision)

        console.log(scene.enemies, '<<enemies')

        this.anims.play('sb-idle')
        
    }
    handleWallCollision() {
        console.log('take wall')
    }
    handleTouchPlayer() {
        console.log('take dmg')
    }
    preUpdate(t,dt)
    {
        super.preUpdate(t, dt)

        const speed = 10
        const awayFromJohn = {relativeX: this.scene.john.x-this.x, relativeY: this.scene.john.y-this.y}
        this.setVelocity(awayFromJohn.relativeX, awayFromJohn.relativeY)
    }
}