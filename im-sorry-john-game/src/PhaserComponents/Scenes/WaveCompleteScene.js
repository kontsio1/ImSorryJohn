import Phaser from 'phaser'

export class WaveCompleteScene extends Phaser.Scene {
  constructor() {
    super('WaveComplete')
  }

  init(data) {
    this.waveNumber = data.waveNumber || 0
    this.nextWaveEnemies = data.nextWaveEnemies || 0
    this.score = data.score || 0
    this.waveBonus = 500
    this.level1Scene = data.level1Scene || null
  }

  create() {
    this.cameras.main.setBackgroundColor('#000000aa')

    const centerX = this.cameras.main.width / 2
    const centerY = this.cameras.main.height / 2

    // Dark overlay background
    this.add.rectangle(centerX, centerY, this.cameras.main.width, this.cameras.main.height, 0x000000, 0.7)

    // Title - WAVE COMPLETE
    this.add.text(centerX, centerY - 150, 'WAVE COMPLETE!', {
      color: '#00ff00',
      fontSize: '72px',
      fontStyle: 'bold',
      align: 'center',
    }).setOrigin(0.5).setDepth(10)

    // Wave info
    this.add.text(centerX, centerY - 50, `Wave ${this.waveNumber} Cleared`, {
      color: '#ffffff',
      fontSize: '36px',
      align: 'center',
    }).setOrigin(0.5).setDepth(10)

    // Score info
    this.add.text(centerX, centerY + 20, `Wave Bonus: +${this.waveBonus} points`, {
      color: '#ffff00',
      fontSize: '28px',
      align: 'center',
    }).setOrigin(0.5).setDepth(10)

    this.add.text(centerX, centerY + 70, `Total Score: ${this.score}`, {
      color: '#00ff00',
      fontSize: '28px',
      align: 'center',
    }).setOrigin(0.5).setDepth(10)

    // Next wave preview
    this.add.text(centerX, centerY + 140, `Next Wave: ${this.nextWaveEnemies} enemies incoming...`, {
      color: '#ff9900',
      fontSize: '24px',
      align: 'center',
    }).setOrigin(0.5).setDepth(10)

    // Separator line
    this.add.line(centerX, centerY + 180, 0, 0, 300, 0, 0xffffff)

    // Countdown timer
    this.countdownValue = 3
    this.countdownText = this.add.text(centerX, centerY + 280, this.countdownValue.toString(), {
      color: '#ff0000',
      fontSize: '120px',
      fontStyle: 'bold',
      align: 'center',
    }).setOrigin(0.5).setDepth(10)
    this.countdownText.setVisible(true)

    // Countdown label
    this.countdownLabel = this.add.text(centerX, centerY + 380, 'Starting next wave in...', {
      color: '#cccccc',
      fontSize: '20px',
      align: 'center',
    }).setOrigin(0.5).setDepth(10)

    // Start countdown immediately when this scene appears.
    this.time.delayedCall(1000, this.decreaseCountdown, [], this)
  }

  decreaseCountdown() {
    this.countdownValue--
    
    // Update text
    this.countdownText.setText(this.countdownValue.toString())
    
    // Visual feedback - change color as countdown progresses
    if (this.countdownValue === 2) {
      this.countdownText.setColor('#ffaa00')
    } else if (this.countdownValue === 1) {
      this.countdownText.setColor('#ffff00')
    }
    
    // Play a small beep sound effect via scaling animation
    this.tweens.add({
      targets: this.countdownText,
      scale: 1.2,
      duration: 100,
      yoyo: true,
    })

    if (this.countdownValue > 0) {
      this.time.delayedCall(1000, this.decreaseCountdown, [], this)
    } else {
      // Countdown complete - resume Level1 and spawn next wave
      this.transitionToNextWave()
    }
  }

  transitionToNextWave() {
    // Stop this scene
    this.scene.stop('WaveComplete')
    
    // Resume Level1
    this.scene.resume('Level1')
    
    // Get the Level1 scene and tell it to spawn the next wave
    const level1 = this.scene.get('Level1')
    if (level1 && level1.startNextWave) {
      level1.startNextWave()
    }
  }
}
