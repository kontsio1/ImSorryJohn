import Phaser from 'phaser'
import { WaveManager } from '../WaveManager'

const DIFFICULTY_KEY = 'imSorryJohn_difficulty'

class MainMenu extends Phaser.Scene {
    constructor() {
        super('MainMenu')
        this.difficultyOptions = WaveManager.getDifficultyPresetNames()
        this.selectedDifficulty = 'normal'
    }

    create() {
        const centerX = this.cameras.main.width / 2
        const centerY = this.cameras.main.height / 2
        this.cameras.main.setBackgroundColor('#000000')

        this.selectedDifficulty = this.loadDifficulty()

        this.add.text(centerX, centerY - 220, "I'M SORRY JOHN", {
            color: '#ffffff',
            fontSize: '68px',
            fontStyle: 'bold',
        }).setOrigin(0.5)

        const playButton = this.add.text(centerX, centerY - 40, 'PLAY', {
            color: '#ffffff',
            backgroundColor: '#dc8b13',
            fontStyle: 'bold',
            fontSize: '54px',
            padding: { x: 20, y: 12 },
        }).setOrigin(0.5).setInteractive()

        this.difficultyButton = this.add.text(centerX, centerY + 90, this.getDifficultyText(), {
            color: '#ffffff',
            backgroundColor: '#444444',
            fontStyle: 'bold',
            fontSize: '36px',
            padding: { x: 20, y: 10 },
        }).setOrigin(0.5).setInteractive()

        playButton.on('pointerdown', () => {
            playButton.setBackgroundColor('#dc8c1386')
            this.time.delayedCall(180, () => {
                this.scene.start('Level1')
            })
        })

        this.difficultyButton.on('pointerdown', () => {
            this.cycleDifficulty()
            this.difficultyButton.setText(this.getDifficultyText())
        })
    }

    loadDifficulty() {
        const saved = localStorage.getItem(DIFFICULTY_KEY)
        return this.difficultyOptions.includes(saved) ? saved : 'normal'
    }

    cycleDifficulty() {
        const currentIndex = this.difficultyOptions.indexOf(this.selectedDifficulty)
        const nextIndex = (currentIndex + 1) % this.difficultyOptions.length
        this.selectedDifficulty = this.difficultyOptions[nextIndex]
        localStorage.setItem(DIFFICULTY_KEY, this.selectedDifficulty)
    }

    getDifficultyText() {
        return `Difficulty: ${WaveManager.getDifficultyLabel(this.selectedDifficulty)}`
    }
}

export { MainMenu }
