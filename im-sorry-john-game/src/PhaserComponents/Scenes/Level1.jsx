import Phaser from 'phaser'
import { createCharacterAnims } from '../Anims'
import Slimeball from '../Characters/Slimeball'
import John from '../Characters/John'

const ENEMY_SPACING_THRESHOLD_SQ = 100 * 100

class Level1 extends Phaser.Scene{
    constructor(){
        super('Level1')
        this.enemyOrderBuffer = []
        this.hpBar = {initialX: 50, spacing:65, heartSizeX: 90, heartSizeY: 90}
    }

    preload(){
        //  Load tile images
        this.load.image('grass_img', 'maps/map_mark1/GrassImage.png');
        this.load.image('wall_img','maps/map_mark1/GroundImage.png');

        //  Load characters
        this.load.atlas('john', 'characters/john/john.png', 'characters/john/john.json');
        this.load.atlas('slimeball', 'characters/slimeball/slimeball.png', 'characters/slimeball/slimeball.json')

        //  Load map
        this.load.tilemapTiledJSON('map1', 'maps/map_mark1/map_mark4.json');

        //load icons
        this.load.atlas('heart_full', 'icons/hearts/heart.png', 'icons/hearts/heart.json')
        this.load.atlas('heart_half', 'icons/hearts/heart_half.png', 'icons/hearts/heart_half.json')
        this.load.atlas('heart_empty', 'icons/hearts/heart_empty.png', 'icons/hearts/heart_empty.json')
        
        this.load.atlas('fireball', 'items/fireball.png', 'items/fireball.json')
        this.load.image('lightsaber', 'items/lightsaber.png')
    }
    
    create(){
        this.controls = this.input.keyboard.addKeys({'up':'W', 'left':'A', 'right':'D', 'down':'S', 'jump':'SPACE', 'item1':'SHIFT', 'throwUp':'UP', 'throwDown':'DOWN', 'throwLeft': 'LEFT', 'throwRight': 'RIGHT'})

        //  Create map
        const map = this.make.tilemap({key: 'map1'})

        //  Add tilesets from images (<tileset name from tiled>,<image>)
        const grass_tiles = map.addTilesetImage('GrassImage', 'grass_img',32,32) 
        const wall_tiles = map.addTilesetImage('WallImage','wall_img',32,32)

        //  Add tilesets as layer to map (<layer name from tiled>,<tileset variable>)
        map.createLayer('Grass', grass_tiles).setScale(2)
        this.walls_layer = map.createLayer('Walls', wall_tiles).setScale(2)

        this.walls_layer.setCollisionByProperty({collides: true})
        
        //create animations
        createCharacterAnims(this.anims)

        //create john
        this.john = new John(this, 700, 500, 'john', 'walk_down1.png')
        
        //add enemies
        this.enemies = this.physics.add.group()

        const slimeball = new Slimeball(this, 100, 300, 'slimeball').setName('slime1')
        const slimeball2 = new Slimeball(this, 500,400, 'slimeball').setName('slime2')
        this.enemies.addMultiple([slimeball, slimeball2])
        // var enemyStartPositions = this.findObjectsByType('enemyStart', this.map, 'objectLayer'); keep in mind for the future

        //create world
        this.physics.world.setBounds(0,0,map.widthInPixels * 2, map.heightInPixels * 2)

        //camera
        const camera = this.cameras.main
        camera.setSize(this.scale.width, this.scale.height)
        camera.setBounds(0,0, map.widthInPixels * 2, map.heightInPixels * 2)
        camera.startFollow(this.john, true, 1,1)

        //container
        this.hpArr = []
        for (let i = 0; i < this.john.maxHp; i++) {
            const heart = this.add.sprite(this.hpBar.initialX + this.hpBar.spacing * i, this.scale.height - 50, 'heart_half').setDisplaySize(this.hpBar.heartSizeX, this.hpBar.heartSizeY)
            this.hpArr.push(heart)
            heart.anims.play('heart-full-idle', true)
        }
        this.hud = this.add.container(0, 0, this.hpArr)
        this.hud.setScrollFactor(0)
        
        this.add.sprite(800,500, 'lightsaber').setDisplaySize(60,60)

        //weapons
        this.fireballs = this.physics.add.group({maxSize: 10, allowGravity: false})
        this.john.setFireballs(this.fireballs)

        //add colliders
        this.physics.add.collider(this.john, this.walls_layer)
        this.physics.add.collider(this.enemies, this.enemies)
        this.physics.add.collider(this.enemies, this.walls_layer)
        this.physics.add.collider(this.john, this.enemies, this.handleEnemyTouch, undefined, this)
        this.physics.add.collider(this.fireballs, this.walls_layer, this.recycleFireball, undefined, this)
        this.physics.add.collider(this.fireballs, this.enemies, this.hitEnemy, undefined, this)

        this.scale.on(Phaser.Scale.Events.RESIZE, this.handleResize, this)
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.onSceneShutdown, this)
    }
    
    update(t,dt)
    {
        this.updateEnemies()
        this.john.update(this.controls)
        this.john.checkIfDead()
    }

    updateEnemies()
    {
        const activeEnemies = this.enemyOrderBuffer
        activeEnemies.length = 0

        const enemies = this.enemies.getChildren()
        const johnX = this.john.x
        const johnY = this.john.y

        for (let i = 0; i < enemies.length; i++) {
            const enemy = enemies[i]

            if (!enemy.active || !enemy.body?.enable) {
                continue
            }

            enemy.updateMovement(this.john)

            const dx = enemy.x - johnX
            const dy = enemy.y - johnY
            enemy.distanceToJohnSq = (dx * dx) + (dy * dy)
            activeEnemies.push(enemy)
        }

        activeEnemies.sort((a, b) => a.distanceToJohnSq - b.distanceToJohnSq)

        for (let i = 0; i < activeEnemies.length - 1; i++) {
            const currentEnemy = activeEnemies[i]
            const nextEnemy = activeEnemies[i + 1]
            const dx = currentEnemy.x - nextEnemy.x
            const dy = currentEnemy.y - nextEnemy.y
            const enemySpacingSq = (dx * dx) + (dy * dy)

            if (enemySpacingSq < ENEMY_SPACING_THRESHOLD_SQ) {
                const relativeAngleInX = currentEnemy.body.velocity.angle() - nextEnemy.body.velocity.angle()

                if (relativeAngleInX >= 0) nextEnemy.body.velocity.rotate(0.35)
                else nextEnemy.body.velocity.rotate(-0.35)
            }
        }
    }

    handleEnemyTouch(john, enemy)
    {
        enemy.handleTouchPlayer(this)
    }

    recycleFireball(fireball)
    {
        if (!fireball?.body) {
            return
        }

        fireball.body.stop()
        fireball.anims.stop()
        fireball.setRotation(0)
        fireball.setFlipX(false)
        fireball.body.offset.x = 0
        fireball.body.offset.y = 6
        fireball.disableBody(true, true)
    }

    hitEnemy(fireball, enemy)
    {  
        if (!enemy?.active) {
            this.recycleFireball(fireball)
            return
        }

        const dx = enemy.x - fireball.x;
        const dy = enemy.y - fireball.y;
        const distance = Math.hypot(dx, dy) || 1
        const dir = {
            x: (dx / distance) * 200,
            y: (dy / distance) * 200,
        }

        this.recycleFireball(fireball)
        enemy.takeDmg(enemy, 5, this, dir) /*change later fireball dmg*/
    }

    handleResize(gameSize)
    {
        const { width, height } = gameSize

        this.cameras.main.setSize(width, height)

        if (!this.hpArr) {
            return
        }

        for (let i = 0; i < this.hpArr.length; i++) {
            this.hpArr[i]
                .setPosition(this.hpBar.initialX + this.hpBar.spacing * i, height - 50)
                .setDisplaySize(this.hpBar.heartSizeX, this.hpBar.heartSizeY)
        }
    }

    onSceneShutdown()
    {
        this.scale.off(Phaser.Scale.Events.RESIZE, this.handleResize, this)
    }

    showMapBarriers() 
    {
        // shows collision terrain  
        const debugGraphics = this.add.graphics().setAlpha(0.7)
        this.walls_layer.renderDebug(debugGraphics, {
            tileColor: null,
            collidingTileColor: new Phaser.Display.Color(243,134,48,255),
            faceColor: new Phaser.Display.Color(40,39,37,255)
        })
    }
}

export {Level1}