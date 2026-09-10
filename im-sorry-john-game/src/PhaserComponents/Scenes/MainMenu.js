import Phaser from 'phaser'

class MainMenu extends Phaser.Scene {
    constructor() {
        super('MainMenu')
    }

    create() {
        const centreX = this.cameras.main.width / 2
        const centreY = this.cameras.main.height / 2

        this.cameras.main.setBackgroundColor('#000000')

        const playButton = this.add.text(centreX, centreY - 50, 'PLAY', {
            color: '#ffffff',
            backgroundColor: '#dc8b13',
            fontStyle: 'bold',
            fontSize: '60px',
        }).setOrigin(0.5).setPadding(10).setInteractive()

        const settingsButton = this.add.text(centreX, centreY + 100, 'SETTINGS', {
            color: '#ffffff',
            backgroundColor: '#dc8b13',
            fontStyle: 'bold',
            fontSize: '60px',
        }).setOrigin(0.5).setPadding(10).setInteractive()

        playButton.on('pointerdown', () => {
            playButton.setBackgroundColor('#dc8c1386')
            this.time.delayedCall(500, () => {
                this.scene.switch('Level1')
            })
        })

        settingsButton.on('pointerdown', () => {
            settingsButton.setBackgroundColor('#dc8c1386')
            this.time.delayedCall(500, () => {
                this.scene.switch('Level1')
            })
        })
    }
}

export { MainMenu }
