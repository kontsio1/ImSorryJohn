import Phaser from 'phaser'

class Level1 extends Phaser.Scene{
    constructor(){
        super('Level1')
    }

    preload(){
        this.centreX = this.cameras.main.width/2
        this.centreY = this.cameras.main.height/2
        
        this.controls = this.input.keyboard.addKeys({'up':'W', 'left':'A', 'right':'D', 'down':'S', 'jump':'SPACE'})

        //  Load tile images
        this.load.image('grass_img', 'maps/map_mark1/GrassImage.png');
        this.load.image('wall_img','maps/map_mark1/GroundImage.png');

        //  Load characters
        this.load.atlas('john', 'characters/john/john.png', 'characters/john/john.json');

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
        
        grass_layer.setPosition(this.centreX - grass_layer.width/2,0)
        walls_layer.setPosition(this.centreX - walls_layer.width/2,0)

        walls_layer.setCollisionByProperty({collides: true})

        this.john = this.physics.add.sprite(this.centreX, this.centreY, 'john', 'john.png')
        // this.john.setBodySize(this.john.body.width*0.5, this.john.body.height*0.5)

        this.physics.add.collider(this.john, walls_layer)

        this.anims.create({
            key: 'john-idle-down',
            frames: [{key: 'john', frame: 'john.png'}]
        })
        this.anims.create({
            key: 'john-run-down',
            frames: this.anims.generateFrameNames('john', { start:2, end:8, prefix: 'image', suffix:'.png'}),
            frameRate: 15,
            repeat: -1
        })

        console.log(this.cameras.main.width)
    }

    update(t,dt){

        if(this.controls.right?.isDown)
        {
            this.john.setVelocity(100)
        }
        else if(this.controls.left?.isDown)
        {
            this.john.setVelocityX(-100)
        } 
        else 
        {
            this.john.setVelocityX(0)
            // this.john.anims.play('john-idle-down')
        }
        if(this.controls.up?.isDown){
            this.john.setVelocityY(-100)
        }
        else if(this.controls.down?.isDown)
        {
            this.john.setVelocityY(100)
            this.john.anims.play('john-run-down', true)
        }
        else
        {
            this.john.setVelocityY(0)
            this.john.anims.play('john-idle-down')
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