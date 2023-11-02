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

        this.controls = this.input.keyboard.addKeys({'up':'W', 'left':'A', 'right':'D', 'down':'S', 'jump':'SPACE', 'item1':'SHIFT', "throwUp":"UP", "throwDown":"DOWN", "throwLeft": "LEFT", "throwRight": "RIGHT",  })

        //  Load tile images
        this.load.image('grass_img', 'maps/map_mark1/GrassImage.png');
        this.load.image('wall_img','maps/map_mark1/GroundImage.png');

        //  Load characters
        this.johnAtlas = this.load.atlas('john', 'characters/john/john.png', 'characters/john/john.json');
        this.slimeAtlas = this.load.atlas('slimeball', 'characters/slimeball/slimeball.png', 'characters/slimeball/slimeball.json')

        //  Load map
        this.load.tilemapTiledJSON('map1', 'maps/map_mark1/map_mark4.json');

        //load icons
        this.load.atlas('heart_full', 'icons/hearts/heart.png', 'icons/hearts/heart.json')
        this.load.atlas('heart_half', 'icons/hearts/heart_half.png', 'icons/hearts/heart_half.json')
        this.load.atlas('heart_empty', 'icons/hearts/heart_empty.png', 'icons/hearts/heart_empty.json')
        
        this.load.atlas('fireball', 'items/fireball.png', 'items/fireball.json')

        // this.load.image('fireball', 'items/fireball.png')
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
        this.enemies.addMultiple([slimeball, slimeball2])
        // var enemyStartPositions = this.findObjectsByType('enemyStart', this.map, 'objectLayer'); keep in mind for the future

        //create world
        this.physics.world.setBounds(0,0,1800, 100)

        //camera
        const camera = this.cameras.main
        camera.setSize(window.innerWidth, window.innerHeight)
        camera.setBounds(0,0, map.widthInPixels*2, map.heightInPixels*2)
        camera.startFollow(this.john, true, 1,1)

        //container
        let hpBar = {initialX: 50, spacing:65, heartSizeX: 90, heartSizeY: 90} // sprite origin is at centre
        this.hpArr = []
        for (let i = 0; i < this.john.maxHp; i++) {
            const heart = this.add.sprite(hpBar.initialX+hpBar.spacing*i,window.innerHeight-50,'heart_half').setDisplaySize(hpBar.heartSizeX, hpBar.heartSizeY)
            this.hpArr.push(heart)
            heart.anims.play('heart-full-idle', true)
        }
        this.hud = this.add.container(0, 0, this.hpArr)
        this.hud.setScrollFactor(0)
        
        this.add.sprite(800,500, 'lightsaber').setDisplaySize(60,60)

        //weapons
        this.fireballs = this.physics.add.group({maxSize: 10})
        this.john.setFireballs(this.fireballs)

        //add colliders
        this.physics.add.collider(this.john, this.walls_layer)
        this.physics.add.collider(this.fireballs, this.walls_layer, this.hitWall)
        this.physics.add.collider(this.fireballs, this.enemies, this.hitEnemy, undefined, this)

        console.log(map.widthInPixels, map.heightInPixels, "<<map")
        console.log(this.game.config.width, this.game.config.height, "<<game")
        console.log(this.cameras.main.width, this.cameras.main.height,"<<camera")
    }
    
    update(t,dt)
    {
        this.john.update(this.controls)
        this.john.checkIfDead()
    }
    hitWall(fireball)
    {
        fireball.destroy()
    }

    hitEnemy(fireball, enemy)
    {  
        const dx = enemy.x - fireball.x;
        const dy = enemy.y - fireball.y;
        const dir = new Phaser.Math.Vector2(dx, dy).normalize().scale(200);

        fireball.destroy()
        enemy.takeDmg(enemy, 5, this, dir) /*change later fireball dmg*/
    }

    showMapBarriers() 
    {
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