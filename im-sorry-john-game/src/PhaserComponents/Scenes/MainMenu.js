import Phaser from 'phaser'

class MainMenu extends Phaser.Scene{
    constructor(){
        super('MainMenu')
    }

    preload(){
        const centreX = this.cameras.main.width/2
        const centreY = this.cameras.main.height/2

        this.cameras.main.setBackgroundColor('#000000')

        this.playButton = this.add.text(centreX, centreY-50, 'PLAY',
            {
                color: '#ffffff',
                backgroundColor: '#dc8b13',
                fontStyle: 'bold',
                fontSize: '60px',
                borderRadius: 1
            }
        ).setOrigin(0.5).setPadding(10).setInteractive()

        this.SettingsButton = this.add.text(centreX, centreY+100, 'SETTINGS',
            {
                color: '#ffffff',
                backgroundColor: '#dc8b13',
                fontStyle: 'bold',
                fontSize: '60px',
                borderRadius: 1
            }
        ).setOrigin(0.5).setPadding(10).setInteractive()
    }

    create(){
        this.playButton.on('pointerdown', ()=>{
            this.playButton.setBackgroundColor('#dc8c1386')
            this.time.delayedCall(500, ()=>{
                this.scene.switch('Level1')
            })
        })

        this.SettingsButton.on('pointerdown', ()=>{
            this.playButton.setBackgroundColor('#dc8c1386')
            this.time.delayedCall(500, ()=>{
                this.scene.switch('Level1')
            })
        })
    }

    update(){

    }
}

export {MainMenu}