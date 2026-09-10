const HIGH_SCORE_KEY = 'imSorryJohn_highScore'
const DIFFICULTY_KEY = 'imSorryJohn_difficulty'
const BOSS_WAVE_INTERVAL = 10

const DIFFICULTY_PRESETS = {
  easy: {
    label: 'Easy',
    enemyCountMultiplier: 0.85,
    healthGrowthPerWave: 0.08,
    speedGrowthPerWave: 0.04,
    damageMultiplier: 0.9,
    scoreMultiplier: 0.9,
  },
  normal: {
    label: 'Normal',
    enemyCountMultiplier: 1,
    healthGrowthPerWave: 0.1,
    speedGrowthPerWave: 0.05,
    damageMultiplier: 1,
    scoreMultiplier: 1,
  },
  hard: {
    label: 'Hard',
    enemyCountMultiplier: 1.2,
    healthGrowthPerWave: 0.14,
    speedGrowthPerWave: 0.07,
    damageMultiplier: 1.2,
    scoreMultiplier: 1.2,
  },
}

const ENEMY_VARIANTS = {
  regular: {
    label: 'Slimeball',
    baseHealth: 10,
    baseSpeed: 100,
    baseDamage: 1,
    score: 100,
    tint: null,
    scale: 1.3,
  },
  runner: {
    label: 'Runner',
    baseHealth: 7,
    baseSpeed: 150,
    baseDamage: 1,
    score: 120,
    tint: 0x88e0ff,
    scale: 1.15,
  },
  striker: {
    label: 'Striker',
    baseHealth: 11,
    baseSpeed: 120,
    baseDamage: 2,
    score: 160,
    tint: 0xffaa44,
    scale: 1.35,
  },
  brute: {
    label: 'Brute',
    baseHealth: 22,
    baseSpeed: 70,
    baseDamage: 3,
    score: 220,
    tint: 0x8dff8d,
    scale: 1.6,
  },
  boss: {
    label: 'Abyssal Slime',
    baseHealth: 160,
    baseSpeed: 95,
    baseDamage: 4,
    score: 1500,
    tint: 0xb56dff,
    scale: 2.2,
  },
}

export class WaveManager {
  constructor(scene, options = {}) {
    this.scene = scene
    this.currentWave = 0
    this.enemiesInWave = 0
    this.enemiesDefeated = 0
    this.totalEnemiesDefeated = 0
    this.score = 0
    this.highScore = this.loadHighScore()
    this.difficulty = this.resolveDifficulty(options.difficulty)
    this.stats = {
      wavesSurvived: 0,
      totalEnemiesKilled: 0,
      damagesTaken: 0,
      totalPlayTime: 0,
    }
    this.sessionStartTime = Date.now()
  }

  resolveDifficulty(proposedDifficulty) {
    if (proposedDifficulty && DIFFICULTY_PRESETS[proposedDifficulty]) {
      this.saveDifficulty(proposedDifficulty)
      return proposedDifficulty
    }

    const savedDifficulty = this.loadDifficulty()
    return DIFFICULTY_PRESETS[savedDifficulty] ? savedDifficulty : 'normal'
  }

  static getDifficultyPresetNames() {
    return Object.keys(DIFFICULTY_PRESETS)
  }

  static getDifficultyLabel(difficulty) {
    return DIFFICULTY_PRESETS[difficulty]?.label ?? DIFFICULTY_PRESETS.normal.label
  }

  getDifficultySettings() {
    return DIFFICULTY_PRESETS[this.difficulty] ?? DIFFICULTY_PRESETS.normal
  }

  setDifficulty(difficulty) {
    if (!DIFFICULTY_PRESETS[difficulty]) {
      return false
    }

    this.difficulty = difficulty
    this.saveDifficulty(difficulty)
    return true
  }

  isBossWave(waveNumber) {
    return waveNumber > 0 && waveNumber % BOSS_WAVE_INTERVAL === 0
  }

  getBaseEnemiesForWave(waveNumber) {
    return Math.min(Math.pow(2, waveNumber), 128)
  }

  getEnemiesForWave(waveNumber) {
    const settings = this.getDifficultySettings()
    const scaledEnemyCount = Math.max(1, Math.round(this.getBaseEnemiesForWave(waveNumber) * settings.enemyCountMultiplier))
    return scaledEnemyCount + (this.isBossWave(waveNumber) ? 1 : 0)
  }

  getEnemyHealthModifier(waveNumber) {
    const settings = this.getDifficultySettings()
    return 1 + (waveNumber * settings.healthGrowthPerWave)
  }

  getEnemySpeedModifier(waveNumber) {
    const settings = this.getDifficultySettings()
    return 1 + (waveNumber * settings.speedGrowthPerWave)
  }

  getEnemyDamageModifier() {
    return this.getDifficultySettings().damageMultiplier
  }

  getWaveVariantCounts(waveNumber) {
    const hasBoss = this.isBossWave(waveNumber)
    const enemySlots = this.getEnemiesForWave(waveNumber) - (hasBoss ? 1 : 0)

    let runner = 0
    let striker = 0
    let brute = 0

    if (waveNumber >= 3) runner = Math.floor(enemySlots * 0.25)
    if (waveNumber >= 5) striker = Math.floor(enemySlots * 0.2)
    if (waveNumber >= 7) brute = Math.floor(enemySlots * 0.2)

    const regular = Math.max(0, enemySlots - runner - striker - brute)

    return {
      regular,
      runner,
      striker,
      brute,
      boss: hasBoss ? 1 : 0,
    }
  }

  getSpawnPlanForWave(waveNumber) {
    const counts = this.getWaveVariantCounts(waveNumber)
    const variants = []

    Object.entries(counts).forEach(([variant, count]) => {
      for (let i = 0; i < count; i++) {
        variants.push(variant)
      }
    })

    return variants
  }

  getVariantStats(variant, waveNumber) {
    const base = ENEMY_VARIANTS[variant] ?? ENEMY_VARIANTS.regular
    const healthModifier = this.getEnemyHealthModifier(waveNumber)
    const speedModifier = this.getEnemySpeedModifier(waveNumber)
    const damageModifier = this.getEnemyDamageModifier()
    const difficultyScoreMultiplier = this.getDifficultySettings().scoreMultiplier
    const bossScaling = variant === 'boss' ? 1 + (Math.floor(waveNumber / BOSS_WAVE_INTERVAL) * 0.35) : 1

    return {
      type: variant,
      label: base.label,
      health: Math.ceil(base.baseHealth * healthModifier * bossScaling),
      speed: Math.ceil(base.baseSpeed * speedModifier),
      damage: Math.max(1, Math.ceil(base.baseDamage * damageModifier)),
      score: Math.ceil(base.score * difficultyScoreMultiplier),
      tint: base.tint,
      scale: base.scale,
    }
  }

  startFirstWave() {
    this.currentWave = 1
    this.enemiesDefeated = 0
    this.enemiesInWave = this.getEnemiesForWave(this.currentWave)
  }

  addScore(points) {
    this.score += points
    if (this.score > this.highScore) {
      this.highScore = this.score
      this.saveHighScore()
    }
  }

  incrementEnemyDefeated(scoreAward = 100) {
    this.enemiesDefeated++
    this.totalEnemiesDefeated++
    this.stats.totalEnemiesKilled++
    this.addScore(scoreAward)
  }

  recordDamage() {
    this.stats.damagesTaken++
  }

  isWaveComplete() {
    return this.enemiesDefeated >= this.enemiesInWave
  }

  nextWave() {
    if (this.currentWave > 0) {
      this.stats.wavesSurvived++
      this.addScore(Math.ceil(500 * this.getDifficultySettings().scoreMultiplier))
    }

    this.currentWave++
    this.enemiesDefeated = 0
    this.enemiesInWave = this.getEnemiesForWave(this.currentWave)
  }

  saveHighScore() {
    localStorage.setItem(HIGH_SCORE_KEY, this.highScore)
  }

  loadHighScore() {
    const saved = localStorage.getItem(HIGH_SCORE_KEY)
    return saved ? parseInt(saved, 10) : 0
  }

  saveDifficulty(difficulty) {
    localStorage.setItem(DIFFICULTY_KEY, difficulty)
  }

  loadDifficulty() {
    return localStorage.getItem(DIFFICULTY_KEY) ?? 'normal'
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
      difficulty: this.difficulty,
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
    this.enemiesInWave = 0
  }
}
