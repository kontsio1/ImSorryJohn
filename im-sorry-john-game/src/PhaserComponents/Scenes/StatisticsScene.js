import Phaser from 'phaser'

export class StatisticsScene extends Phaser.Scene {
  constructor() {
    super('Statistics')
  }

  init(data) {
    this.stats = data.stats || {}
  }

  create() {
    this.cameras.main.setBackgroundColor('#000000')

    const centerX = this.cameras.main.width / 2
    const startY = 100
    const lineHeight = 50

    // Title
    this.add.text(centerX, startY, 'GAME OVER - STATISTICS', {
      color: '#ff0000',
      fontSize: '48px',
      fontStyle: 'bold',
    }).setOrigin(0.5)

    // Stats display
    let currentY = startY + 80
    const statLines = [
      { label: 'Difficulty:', value: this.stats.difficulty || 'normal' },
      { label: 'Final Wave:', value: this.stats.finalWave },
      { label: 'Total Score:', value: this.stats.totalScore },
      { label: 'High Score:', value: this.stats.highScore, color: '#ffff00' },
      { label: 'Enemies Killed:', value: this.stats.totalEnemiesKilled },
      { label: 'Damage Taken:', value: this.stats.damagesTaken },
      { label: 'Waves Survived:', value: this.stats.wavesSurvived },
      { label: 'Session Time:', value: this.formatTime(this.stats.sessionTime) },
    ]

    statLines.forEach((stat, index) => {
      const color = stat.color || '#ffffff'
      this.add.text(centerX - 150, currentY, stat.label, {
        color: color,
        fontSize: '24px',
        fontStyle: 'bold',
      }).setOrigin(1, 0.5)

      this.add.text(centerX + 50, currentY, stat.value.toString(), {
        color: color,
        fontSize: '24px',
      }).setOrigin(0, 0.5)

      currentY += lineHeight
    })

    // Return to menu button
    currentY += 40
    const menuButton = this.add.text(centerX, currentY, 'Return to Menu', {
      color: '#ffffff',
      backgroundColor: '#0066cc',
      fontSize: '20px',
      padding: { x: 20, y: 10 },
    }).setOrigin(0.5).setInteractive()

    menuButton.on('pointerdown', () => {
      this.scene.stop('Statistics')
      this.scene.stop('Level1')
      this.scene.start('MainMenu')
    })

    menuButton.on('pointerover', () => {
      menuButton.setBackgroundColor('#0099ff')
    })

    menuButton.on('pointerout', () => {
      menuButton.setBackgroundColor('#0066cc')
    })
  }

  formatTime(seconds) {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }
}

