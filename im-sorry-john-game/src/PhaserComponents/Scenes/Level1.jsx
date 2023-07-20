import Phaser from 'phaser'
import { createCharacterAnims } from '../Anims'
import Slimeball from '../Characters/Slimeball'

class Level1 extends Phaser.Scene{
    constructor(){
        super('Level1')
    }

    preload(){
        this.centreX = this.game.config.height/2
        this.centreY = this.game.config.width/2

        this.controls = this.input.keyboard.addKeys({'up':'W', 'left':'A', 'right':'D', 'down':'S', 'jump':'SPACE'})

        //  Load tile images
        this.load.image('grass_img', 'maps/map_mark1/GrassImage.png');
        this.load.image('wall_img','maps/map_mark1/GroundImage.png');

        //  Load characters
        this.load.atlas('john', 'characters/john/john.png', 'characters/john/john.json');
        this.load.atlas('slimeball', 'characters/slimeball/slimeball.png', 'characters/slimeball/slimeball.json')

        //  Load map
        this.load.tilemapTiledJSON('map1', 'maps/map_mark1/map_mark4.json');

    }
    
    create(){
        //  Create map
        const map = this.make.tilemap({key: 'map1'})

        //  Add tilesets from images (<tileset name from tiled>,<image>)
        const grass_tiles = map.addTilesetImage('GrassImage', 'grass_img',32,32) 
        const wall_tiles = map.addTilesetImage('WallImage','wall_img',32,32)

        //  Add tilesets as layer to map (<layer name from tiled>,<tileset variable>)
        const grass_layer = map.createLayer('Grass', grass_tiles)
        const walls_layer = map.createLayer('Walls', wall_tiles)
        
        grass_layer.setPosition(this.centreX,100)
        walls_layer.setPosition(this.centreX,100)

        walls_layer.setCollisionByProperty({collides: true})
        
        //create animations
        createCharacterAnims(this.anims)

        //create john
        this.john = this.physics.add.sprite(this.centreX+400, this.centreY, 'john', 'walk_down1.png')
        this.john.setScale(0.25)
        this.john.setBodySize(100, 290)
        this.john.isIdle = true
        
        //add enemies
        const slimeballs = this.physics.add.group({
            classType: Slimeball
        })
        slimeballs.get(this.centreX, this.centreY).setCircle(7, 9, 12)
        
        //add colliders
        this.physics.add.collider(this.john, walls_layer)
        this.physics.add.collider(slimeballs, walls_layer)
        this.physics.add.collider(this.john, slimeballs)

        //create world
        this.physics.world.setBounds(0,0,map.widthInPixels, map.heightInPixels)
        const camera = this.cameras.main
        camera.setBounds(0,0, map.widthInPixels, map.heightInPixels+200)
        camera.startFollow(this.john, true, 0.1,0.1,0,0)

        console.log(map.widthInPixels, map.heightInPixels, "<<map")
        console.log(this.game.config.width, this.game.config.height, "<<game")
        console.log(this.cameras.main.width, this.cameras.main.height,"<<camera")
    }
    
    update(t,dt){
        //camera
        
        // let scrol_x = this.john.x - this.game.config.width/2
        // let scrol_y = this.john.y - this.game.config.height/2

        // this.cameras.main.scrollX = scrol_x
        // this.cameras.main.scrollY = scrol_y

        //john controls
        const v = 150

        if(this.controls.right?.isDown && this.john.isIdle)
        {
            this.john.setVelocity(v,0)
            this.john.anims.play('john-walk-east', true)

        }
        else if(this.controls.left?.isDown && this.john.isIdle)
        {
            this.john.setVelocity(-v,0)
            this.john.anims.play('john-walk-west', true)
        }
        else if(this.controls.up?.isDown && this.john.isIdle){
            this.john.setVelocity(0,-v)
            this.john.anims.play('john-walk-up', true)
        }
        else if(this.controls.down?.isDown && this.john.isIdle)
        {
            this.john.setVelocity(0,v)
            this.john.anims.play('john-walk-down', true)
        }
        else if(this.john.isIdle)
        {
            this.john.setVelocity(0,0)
            this.john.anims.play('john-idle', true)
        }
        if(Phaser.Input.Keyboard.JustDown(this.controls.jump) && this.john.isIdle){
            this.john.setVelocity(0,0)
            this.john.isIdle = false
            this.john.anims.play('john-tp-out',true)
            this.time.addEvent({
                delay:800,
                callback:() => {
                    if(this.controls.right.isDown)
                    {
                        this.john.setPosition(this.john.x+200,this.john.y)
                    }
                    if(this.controls.left.isDown)
                    {
                        this.john.setPosition(this.john.x-200,this.john.y)
                    }
                    if(this.controls.up.isDown)
                    {
                        this.john.setPosition(this.john.x,this.john.y-200)
                    }
                    if(this.controls.down.isDown)
                    {
                        this.john.setPosition(this.john.x,this.john.y+200)
                    }
                    this.john.anims.play('john-tp-in')
                    this.john.once('animationcomplete',()=>{
                        this.john.isIdle = true
                    })
                }
            })  
        }
    }

    showMapBarriers() {
        // shows collision terrain  
        const debugGraphics = this.add.graphics().setAlpha(0.7)
        this.rocksLayer.renderDebug(debugGraphics, {
            tileColor: null,
            collidingTileColor: new Phaser.Display.Color(243,134,48,255),
            faceColor: new Phaser.Display.Color(40,39,37,255)
        })
    }

}

export {Level1}