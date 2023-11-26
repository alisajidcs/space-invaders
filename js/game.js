class Game {
  constructor(canvas) {
    this.canvas = canvas
    this.width = this.canvas.width
    this.height = this.canvas.height
    this.keys = []
    this.player = new Player(this)

    this.projectilePool = []
    this.numberOfProjectile = 15
    this.createProjectiles()
    this.fired = false

    this.columns = 1
    this.rows = 1
    this.enemySize = 80
    this.enemyGap = 20

    this.waves = []
    this.waves.push(new Wave(this))
    this.waveCount = 1

    this.spriteUpdate = false
    this.spriteTimer = 0
    this.spriteInterval = 150

    this.score = 0
    this.gameOver = false

    window.addEventListener('keydown', e => {
      if (!this.hasKey(e.key)) this.keys.push(e.key)
      if (e.key === this.player.controls.shoot && !this.fired)
        this.player.shoot()
      this.fired = true
      if (e.key === this.player.controls.restart && this.gameOver)
        this.restart()
    })

    window.addEventListener('keyup', e => {
      const keyIndex = this.keys.indexOf(e.key)
      if (keyIndex !== -1) this.keys.splice(keyIndex, 1)
      this.fired = false
    })
  }

  render(context, deltaTime) {
    // sprite timing
    if (this.spriteTimer > this.spriteInterval) {
      this.spriteUpdate = true
      this.spriteTimer = 0
    } else {
      this.spriteUpdate = false
      this.spriteTimer += deltaTime
    }

    this.drawStatusText(context)
    this.player.draw(context)
    this.player.update()
    this.projectilePool.forEach(projectile => {
      projectile.update()
      projectile.draw(context)
    })
    this.waves.forEach(wave => {
      wave.render(context)
      if (wave.enemies.length < 1 && !wave.nextWaveTrigger && !this.gameOver) {
        this.newWave()
        this.waveCount++
        wave.nextWaveTrigger = true
        if (this.player.lives < this.player.maxLives) this.player.lives++
      }
    })
  }

  createProjectiles() {
    for (let i = 0; i < this.numberOfProjectile; i++) {
      this.projectilePool.push(new Projectile())
    }
  }

  getProjectile() {
    for (let i = 0; i < this.numberOfProjectile; i++) {
      if (this.projectilePool[i].free) return this.projectilePool[i]
    }
  }

  checkCollision(a, b) {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    )
  }

  drawStatusText(context) {
    context.save()
    context.shadowOffsetX = 3
    context.shadowOffsetY = 3
    context.shadowColor = 'black'
    context.fillText('Score: ' + this.score, 20, 40)
    context.fillText('Wave: ' + this.waveCount, 20, 80)
    for (let i = 0; i < this.player.maxLives; i++) {
      context.strokeRect(20 + 20 * i, 100, 10, 15)
    }
    for (let i = 0; i < this.player.lives; i++) {
      context.fillRect(20 + 20 * i, 100, 10, 15)
    }
    if (this.gameOver) {
      context.textAlign = 'center'
      context.font = '100px Impact'
      context.fillText('GAME OVER!', this.width * 0.5, this.height * 0.5)
      context.font = '20px Impact'
      context.fillText(
        'Press R to restart!',
        this.width * 0.5,
        this.height * 0.5 + 30,
      )
    }
    context.restore()
  }

  newWave() {
    if (
      Math.random() < 0.5 &&
      this.columns * this.enemySize < this.width * 0.8
    ) {
      this.columns++
    } else if (this.rows * this.enemySize < this.height * 0.6) {
      this.rows++
    }
    this.waves.push(new Wave(this))
  }

  restart() {
    this.player.restart()
    this.columns = 2
    this.rows = 2
    this.waves = []
    this.waves.push(new Wave(this))
    this.waveCount = 1
    this.score = 0
    this.gameOver = false
  }

  hasKey(key) {
    return this.keys.indexOf(key) !== -1
  }
}
