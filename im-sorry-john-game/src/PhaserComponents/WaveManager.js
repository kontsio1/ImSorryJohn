export class WaveManager {
  constructor(scene) {
    this.scene = scene
    this.currentWave = 0
    this.enemiesInWave = 0
    this.enemiesDefeated = 0
    this.totalEnemiesDefeated = 0
    this.score = 0
    this.highScore = this.loadHighScore()
    this.stats = {
      wavesSurvived: 0,
      totalEnemiesKilled: 0,
      damagesTaken: 0,
      totalPlayTime: 0,
    }
    this.sessionStartTime = Date.now()
  }

  // Wave progression: exponential growth
  // Wave 1: 2, Wave 2: 4, Wave 3: 8, Wave 4: 16, Wave 5: 32, etc. (capped at 128)
  getEnemiesForWave(waveNumber) {
    return Math.min(Math.pow(2, waveNumber), 128)
  }

  // Difficulty scaling per wave
  getEnemyHealthModifier(waveNumber) {
    return 1 + (waveNumber * 0.1)
  }

  getEnemySpeedModifier(waveNumber) {
    return 1 + (waveNumber * 0.05)
  }

  addScore(points) {
    this.score += points
    if (this.score > this.highScore) {
      this.highScore = this.score
      this.saveHighScore()
    }
  }

  incrementEnemyDefeated() {
    this.enemiesDefeated++
    this.totalEnemiesDefeated++
    this.stats.totalEnemiesKilled++
    this.addScore(100) // 100 points per enemy
  }

  recordDamage() {
    this.stats.damagesTaken++
  }

  isWaveComplete() {
    return this.enemiesDefeated >= this.enemiesInWave
  }

  nextWave() {
    this.currentWave++
    this.stats.wavesSurvived++
    this.enemiesDefeated = 0
    this.enemiesInWave = this.getEnemiesForWave(this.currentWave)
    this.addScore(500) // Bonus for completing wave
  }

  saveHighScore() {
    localStorage.setItem('imSorryJohn_highScore', this.highScore)
  }

  loadHighScore() {
    const saved = localStorage.getItem('imSorryJohn_highScore')
    return saved ? parseInt(saved, 10) : 0
  }

  getSessionStats() {
    this.stats.totalPlayTime = Math.floor((Date.now() - this.sessionStartTime) / 1000)
    return {
      finalWave: this.currentWave,
      totalScore: this.score,
      highScore: this.highScore,
      totalEnemiesKilled: this.stats.totalEnemiesKilled,
      damagesTaken: this.stats.damagesTaken,
      wavesSurvived: this.stats.wavesSurvived,
      sessionTime: this.stats.totalPlayTime,
    }
  }

  reset() {
    this.currentWave = 0
    this.enemiesDefeated = 0
    this.totalEnemiesDefeated = 0
    this.score = 0
    this.stats = {
      wavesSurvived: 0,
      totalEnemiesKilled: 0,
      damagesTaken: 0,
      totalPlayTime: 0,
    }
    this.sessionStartTime = Date.now()
    this.enemiesInWave = this.getEnemiesForWave(1)
  }
}
