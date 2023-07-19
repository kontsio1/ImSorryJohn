import Phaser from "phaser";
import { Level1 } from "../Scenes/Level1";

export default class Slimeball extends Phaser.Physics.Arcade.Sprite
{
    constructor(scene, x, y, texture, frame)
    {
        super(scene, x, y, texture, frame)

        this.setScale(1.3)
        
        this.anims.play('sb-idle')
    }
    preUpdate(t,dt)
    {
        super.preUpdate(t, dt)
    }
}