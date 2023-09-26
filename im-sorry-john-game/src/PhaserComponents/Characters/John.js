import Phaser from "phaser";

export default class John extends Phaser.Physics.Arcade.Sprite
{
    speed = 150

    constructor(scene, x, y, key, frame)
    {
        super(scene, x, y)
        scene.physics.add.existing(this)
        scene.add.existing(this)
        this.anims.play('john-idle', true)
        this.setScale(0.25)
        this.setBodySize(100, 290)
        this.isIdle = true
    }
    update(controls)
    {   
        if(this.isIdle)
        {
            if(controls.right?.isDown)
            {
                this.setVelocity(this.speed,0)
                this.anims.play('john-walk-east', true)
    
            }
            else if(controls.left?.isDown)
            {
                this.setVelocity(-this.speed,0)
                this.anims.play('john-walk-west', true)
            }
            else if(controls.up?.isDown){
                this.setVelocity(0,-this.speed)
                this.anims.play('john-walk-up', true)
            }
            else if(controls.down?.isDown)
            {
                this.setVelocity(0,this.speed)
                this.anims.play('john-walk-down', true)
            }
            else if(this.isIdle)
            {
                this.setVelocity(0,0)
                this.anims.play('john-idle', true)
            }
            if(Phaser.Input.Keyboard.JustDown(controls.jump)){
                this.setVelocity(0,0)
                this.isIdle = false
                this.anims.play('john-tp-out',true)
                this.scene.time.addEvent({
                    delay:800,
                    callback:() => {
                        if(controls.right.isDown)
                        {
                            this.setPosition(this.x+200,this.y)
                        }
                        if(controls.left.isDown)
                        {
                            this.setPosition(this.x-200,this.y)
                        }
                        if(controls.up.isDown)
                        {
                            this.setPosition(this.x,this.y-200)
                        }
                        if(controls.down.isDown)
                        {
                            this.setPosition(this.x,this.y+200)
                        }
                        this.anims.play('john-tp-in')
                        this.once('animationcomplete',()=>{
                            this.isIdle = true
                        })
                    }
                })  
            }
        }
    }
}