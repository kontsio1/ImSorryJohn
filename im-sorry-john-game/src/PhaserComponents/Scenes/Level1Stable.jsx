import Phaser from 'phaser'
import { createCharacterAnims } from '../Anims'
import Slimeball from '../Characters/Slimeball'
import John from '../Characters/John'
import { WaveManager } from '../WaveManager'
import { johnTakeDmg } from '../Functions/johnTakeDmg'

const ENEMY_SPACING_THRESHOLD_SQ = 100 * 100
const WAVE_CLEAR_HOLD_MS = 3000

class Level1 extends Phaser.Scene {
    constructor() {
        super('Level1')
        this.enemyOrderBuffer = []
        this.hpBar = { initialX: 50, spacing: 65, heartSizeX: 90, heartSizeY: 90 }
        this.waveManager = null
        this.spawnPositions = []
        this.waveInProgress = false
        this.waveTransitioning = false
        this.waveClearDelayEvent = null
    }

    preload() {
        this.load.image('grass_img', 'maps/map_mark1/GrassImage.png')
        this.load.image('wall_img', 'maps/map_mark1/GroundImage.png')
        this.load.atlas('john', 'characters/john/john.png', 'characters/john/john.json')
        this.load.atlas('slimeball', 'characters/slimeball/slimeball.png', 'characters/slimeball/slimeball.json')
        this.load.tilemapTiledJSON('map1', 'maps/map_mark1/map_mark4.json')
        this.load.atlas('heart_full', 'icons/hearts/heart.png', 'icons/hearts/heart.json')
        this.load.atlas('heart_half', 'icons/hearts/heart_half.png', 'icons/hearts/heart_half.json')
        this.load.atlas('heart_empty', 'icons/hearts/heart_empty.png', 'icons/hearts/heart_empty.json')
        this.load.atlas('fireball', 'items/fireball.png', 'items/fireball.json')
        this.load.image('lightsaber', 'items/lightsaber.png')
    }

    create() {
        this.controls = this.input.keyboard.addKeys({
            up: 'W',
            left: 'A',
            right: 'D',
            down: 'S',
            jump: 'SPACE',
            item1: 'SHIFT',
            throwUp: 'UP',
            throwDown: 'DOWN',
            throwLeft: 'LEFT',
            throwRight: 'RIGHT',
        })

        const map = this.make.tilemap({ key: 'map1' })
        const grassTiles = map.addTilesetImage('GrassImage', 'grass_img', 32, 32)
        const wallTiles = map.addTilesetImage('WallImage', 'wall_img', 32, 32)

        map.createLayer('Grass', grassTiles).setScale(2)
        this.walls_layer = map.createLayer('Walls', wallTiles).setScale(2)
        this.walls_layer.setCollisionByProperty({ collides: true })

        createCharacterAnims(this.anims)

        this.john = new John(this, 700, 500, 'john', 'walk_down1.png')

        this.enemies = this.physics.add.group()
        this.spawnPositions = [
            [150, 150],
            [1650, 150],
            [1650, 850],
            [150, 850],
            [900, 100],
            [900, 900],
        ]

        this.waveManager = new WaveManager(this)
        this.waveManager.startFirstWave()
        this.waveInProgress = true
        this.spawnWave()

        this.physics.world.setBounds(0, 0, map.widthInPixels * 2, map.heightInPixels * 2)

        const camera = this.cameras.main
        camera.setSize(this.scale.width, this.scale.height)
        camera.setBounds(0, 0, map.widthInPixels * 2, map.heightInPixels * 2)
        camera.startFollow(this.john, true, 1, 1)

        this.hpArr = []
        for (let i = 0; i < this.john.maxHp; i++) {
            const heart = this.add
                .sprite(this.hpBar.initialX + this.hpBar.spacing * i, this.scale.height - 50, 'heart_half')
                .setDisplaySize(this.hpBar.heartSizeX, this.hpBar.heartSizeY)
                .setScrollFactor(0)
            this.hpArr.push(heart)
            heart.anims.play('heart-full-idle', true)
        }

        this.hud = this.add.container(0, 0, this.hpArr)
        this.hud.setScrollFactor(0)

        this.add.sprite(800, 500, 'lightsaber').setDisplaySize(60, 60)

        this.fireballs = this.physics.add.group({ maxSize: 10, allowGravity: false })
        this.john.setFireballs(this.fireballs)

        this.physics.add.collider(this.john, this.walls_layer)
        this.physics.add.collider(this.enemies, this.enemies)
        this.physics.add.collider(this.enemies, this.walls_layer)
        this.physics.add.collider(this.john, this.enemies, this.handleEnemyTouch, undefined, this)
        this.physics.add.collider(this.fireballs, this.walls_layer, this.recycleFireball, undefined, this)
        this.physics.add.collider(this.fireballs, this.enemies, this.hitEnemy, undefined, this)

        this.scale.on(Phaser.Scale.Events.RESIZE, this.handleResize, this)
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.onSceneShutdown, this)
    }

    update(_time, dt) {
        this.updateEnemies()
        this.john.update(this.controls, dt)
        this.john.checkIfDead()

        if (!this.waveTransitioning && this.waveInProgress) {
            const activeEnemies = this.enemies.getChildren().filter((enemy) => enemy.active)
            if (activeEnemies.length === 0 && this.waveManager.enemiesDefeated >= this.waveManager.enemiesInWave) {
                this.waveInProgress = false
                this.waveTransitioning = true
                this.queueWaveCountdown()
            }
        }

        this.updateHUD()
    }

    queueWaveCountdown() {
        if (this.waveStatusText) {
            this.waveStatusText.setText('Wave cleared!')
            this.waveStatusText.setVisible(true)
        }

        this.waveClearDelayEvent = this.time.delayedCall(WAVE_CLEAR_HOLD_MS, () => {
            this.triggerWaveComplete()
        })
    }

    spawnWave() {
        const spawnPlan = this.waveManager.getSpawnPlanForWave(this.waveManager.currentWave)

        for (let i = 0; i < spawnPlan.length; i++) {
            const variant = spawnPlan[i]
            const spawnPos = this.spawnPositions[(i + this.waveManager.currentWave) % this.spawnPositions.length]
            const variantStats = this.waveManager.getVariantStats(variant, this.waveManager.currentWave)
            const enemy = new Slimeball(this, spawnPos[0], spawnPos[1], 'slimeball', variantStats)
                .setName(`${variant}_wave${this.waveManager.currentWave}_${i}`)

            this.enemies.add(enemy)
        }
    }

    updateEnemies() {
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
                const relativeAngle = currentEnemy.body.velocity.angle() - nextEnemy.body.velocity.angle()
                if (relativeAngle >= 0) {
                    nextEnemy.body.velocity.rotate(0.35)
                } else {
                    nextEnemy.body.velocity.rotate(-0.35)
                }
            }
        }
    }

    damageEnemiesInLandingEllipse(centerX, centerY, radiusX, radiusY, damage, knockback) {
        const enemies = this.enemies.getChildren()

        for (let i = 0; i < enemies.length; i++) {
            const enemy = enemies[i]
            if (!enemy.active || !enemy.body?.enable) {
                continue
            }

            const dx = enemy.x - centerX
            const dy = enemy.y - centerY
            const ellipseDistance = ((dx * dx) / (radiusX * radiusX)) + ((dy * dy) / (radiusY * radiusY))

            if (ellipseDistance > 1) {
                continue
            }

            const distance = Math.hypot(dx, dy) || 1
            const dir = {
                x: (dx / distance) * knockback,
                y: (dy / distance) * knockback,
            }

            const hadHealth = enemy.health > 0
            enemy.takeDmg(enemy, damage, this, dir)

            if (hadHealth && enemy.health <= 0) {
                this.waveManager.incrementEnemyDefeated(enemy.scoreValue)
            }
        }
    }

    handleEnemyTouch(john, enemy) {
        const dx = john.x - enemy.x
        const dy = john.y - enemy.y
        const distance = Math.hypot(dx, dy) || 1

        const didTakeDamage = johnTakeDmg(this, enemy.damage, {
            x: (dx / distance) * 200,
            y: (dy / distance) * 200,
        })

        if (didTakeDamage) {
            this.waveManager.recordDamage()
        }
    }

    recycleFireball(fireball) {
        if (!fireball?.body) {
            return
        }

        fireball.body.stop()
        fireball.anims.stop()
        fireball.setRotation(0)
        fireball.setFlipX(false)
        fireball.setScale(1, 1)
        fireball.body.offset.x = 0
        fireball.body.offset.y = 6
        fireball.setData('damage', undefined)
        fireball.disableBody(true, true)
    }

    hitEnemy(fireball, enemy) {
        if (!enemy?.active) {
            this.recycleFireball(fireball)
            return
        }

        const dx = enemy.x - fireball.x
        const dy = enemy.y - fireball.y
        const distance = Math.hypot(dx, dy) || 1
        const dir = {
            x: (dx / distance) * 200,
            y: (dy / distance) * 200,
        }

        const damage = fireball.getData('damage') ?? 5
        this.recycleFireball(fireball)

        const hadHealth = enemy.health > 0
        enemy.takeDmg(enemy, damage, this, dir)

        if (hadHealth && enemy.health <= 0) {
            this.waveManager.incrementEnemyDefeated(enemy.scoreValue)
        }
    }

    updateHUD() {
        if (!this.waveText) {
            this.waveText = this.add
                .text(this.hpBar.initialX, this.scale.height - 120, '', {
                    color: '#ffffff',
                    fontSize: '18px',
                    fontStyle: 'bold',
                })
                .setScrollFactor(0)
        }

        const difficultyLabel = WaveManager.getDifficultyLabel(this.waveManager.difficulty)
        this.waveText.setText(`Wave: ${this.waveManager.currentWave} (${difficultyLabel}) | Enemies: ${this.waveManager.enemiesDefeated}/${this.waveManager.enemiesInWave}`)

        if (!this.scoreText) {
            this.scoreText = this.add
                .text(this.scale.width / 2, this.scale.height - 50, '', {
                    color: '#00ff00',
                    fontSize: '16px',
                })
                .setScrollFactor(0)
                .setOrigin(0.5, 1)
        }
        this.scoreText.setText(`Score: ${this.waveManager.score}`)

        if (!this.highScoreText) {
            this.highScoreText = this.add
                .text(this.scale.width - 20, this.scale.height - 50, '', {
                    color: '#ffff00',
                    fontSize: '16px',
                })
                .setScrollFactor(0)
                .setOrigin(1, 1)
        }
        this.highScoreText.setText(`High Score: ${this.waveManager.highScore}`)

        if (!this.waveStatusText) {
            this.waveStatusText = this.add
                .text(this.scale.width / 2, this.scale.height / 2 - 40, '', {
                    color: '#00ff88',
                    fontSize: '42px',
                    fontStyle: 'bold',
                })
                .setOrigin(0.5)
                .setScrollFactor(0)
                .setDepth(100)
        }
    }

    triggerWaveComplete() {
        if (this.waveStatusText) {
            this.waveStatusText.setVisible(false)
        }

        this.scene.pause()
        this.scene.launch('WaveComplete', {
            waveNumber: this.waveManager.currentWave,
            nextWaveEnemies: this.waveManager.getEnemiesForWave(this.waveManager.currentWave + 1),
            score: this.waveManager.score,
        })
    }

    startNextWave() {
        this.waveManager.nextWave()
        this.waveManager.enemiesDefeated = 0
        this.spawnWave()
        this.waveInProgress = true
        this.waveTransitioning = false
        this.waveClearDelayEvent = null
    }

    showGameOver() {
        if (this.waveClearDelayEvent) {
            this.waveClearDelayEvent.remove(false)
            this.waveClearDelayEvent = null
        }

        this.scene.pause()
        this.scene.launch('Statistics', {
            stats: this.waveManager.getSessionStats(),
        })
    }

    handleResize(gameSize) {
        const { width, height } = gameSize
        this.cameras.main.setSize(width, height)

        if (this.hpArr) {
            for (let i = 0; i < this.hpArr.length; i++) {
                this.hpArr[i]
                    .setPosition(this.hpBar.initialX + this.hpBar.spacing * i, height - 50)
                    .setDisplaySize(this.hpBar.heartSizeX, this.hpBar.heartSizeY)
            }
        }

        if (this.waveText) this.waveText.setPosition(this.hpBar.initialX, height - 120)
        if (this.scoreText) this.scoreText.setPosition(width / 2, height - 50)
        if (this.highScoreText) this.highScoreText.setPosition(width - 20, height - 50)
        if (this.waveStatusText) this.waveStatusText.setPosition(width / 2, height / 2 - 40)
    }

    onSceneShutdown() {
        this.scale.off(Phaser.Scale.Events.RESIZE, this.handleResize, this)

        if (this.waveClearDelayEvent) {
            this.waveClearDelayEvent.remove(false)
            this.waveClearDelayEvent = null
        }

        this.waveManager?.saveHighScore()
    }
}

export { Level1 }

