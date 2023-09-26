import Phaser from 'phaser'
import { createCharacterAnims } from '../Anims'
import Slimeball from '../Characters/Slimeball'
import John from '../Characters/John'

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
        this.johnAtlas = this.load.atlas('john', 'characters/john/john.png', 'characters/john/john.json');
        this.slimeAtlas = this.load.atlas('slimeball', 'characters/slimeball/slimeball.png', 'characters/slimeball/slimeball.json')

        //  Load map
        this.load.tilemapTiledJSON('map1', 'maps/map_mark1/map_mark4.json');

        //load icons
        this.load.image('heart', 'icons/heart.png')

        this.load.image('fireball', 'items/fireball.png')
        this.load.image('lightsaber', 'items/lightsaber.png')

    }
    
    create(){
        //  Create map
        const map = this.make.tilemap({key: 'map1'})

        //  Add tilesets from images (<tileset name from tiled>,<image>)
        const grass_tiles = map.addTilesetImage('GrassImage', 'grass_img',32,32) 
        const wall_tiles = map.addTilesetImage('WallImage','wall_img',32,32)

        //  Add tilesets as layer to map (<layer name from tiled>,<tileset variable>)
        const grass_layer = map.createLayer('Grass', grass_tiles).setScale(2)
        this.walls_layer = map.createLayer('Walls', wall_tiles).setScale(2)

        this.walls_layer.setCollisionByProperty({collides: true})
        
        //create animations
        createCharacterAnims(this.anims)

        //create john
        const player = new Phaser.Physics.Arcade.Group(this.world, this)
        this.john = new John(this, 700, 500, 'john', 'walk_down1.png')
        player.add(this.john)
        
        //add enemies
        this.enemies = new Phaser.Physics.Arcade.Group(this.world, this)

        let slimeball = new Slimeball(this, 100, 300, "slime1").setName('slime1')
        let slimeball2 = new Slimeball(this, 500,400, "slime2").setName('slime2')
        let slimeball3 = new Slimeball(this, 600,400, "slime3").setName('slime3')
        let slimeball4 = new Slimeball(this, 200,500, "slime4").setName('slime4')
        let slimeball5 = new Slimeball(this, 300,200, "slime5").setName('slime5')
        this.enemies.addMultiple([slimeball, slimeball2, slimeball3, slimeball4, slimeball5])
    
        
        // var enemyStartPositions = this.findObjectsByType('enemyStart', this.map, 'objectLayer'); keep in mind for the future

        //add colliders
        this.physics.add.collider(this.john, this.walls_layer)

        //create world
        this.physics.world.setBounds(0,0,1800, 100)

        //camera
        const camera = this.cameras.main
        camera.setSize(window.innerWidth, window.innerHeight)
        camera.setBounds(0,0, map.widthInPixels*2, map.heightInPixels*2)
        camera.startFollow(this.john, true, 1,1)

        //container
        let hpBar = {initialX: 30, spacing:5, heartSizeX: 50, heartSizeY: 50} // sprite origin is at centre
        let hpArr = []
        for (let i = 0; i < 5; i++) {
            hpArr.push(this.add.sprite(hpBar.initialX + i *  (hpBar.heartSizeX + hpBar.spacing), window.innerHeight-50,'heart').setDisplaySize(hpBar.heartSizeX, hpBar.heartSizeY))
        }
        let hud = this.add.container(0, 0, hpArr)
        hud.setScrollFactor(0)

        this.add.sprite(700,500, 'fireball').setDisplaySize(30,30)
        this.add.sprite(800,500, 'lightsaber').setDisplaySize(60,60)

        console.log(map.widthInPixels, map.heightInPixels, "<<map")
        console.log(this.game.config.width, this.game.config.height, "<<game")
        console.log(this.cameras.main.width, this.cameras.main.height,"<<camera")
    }
    
    update(t,dt){
        if(this.john)
        {
            this.john.update(this.controls)
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