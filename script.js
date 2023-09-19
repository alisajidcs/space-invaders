class Player {
  constructor(game) {
    this.game = game
    this.width = 100
    this.height = 100
    this.x = this.game.width * 0.5 - this.width * 0.5
    this.y = this.game.height - this.height
    this.speed = 5
    this.controls = {
      left: 'a',
      right: 'd',
      shoot: ' ',
      restart: 'r',
    }
    this.lives = 3
  }

  draw(context) {
    context.fillRect(this.x, this.y, this.height, this.width)
  }

  update() {
    // horizontal movement
    if (this.game.hasKey(this.controls.right)) this.x += this.speed
    if (this.game.hasKey(this.controls.left)) this.x -= this.speed

    // horizontal boundaries restrictions
    if (this.x < -this.width * 0.5) this.x = -this.width * 0.5
    else if (this.x > this.game.width - this.width * 0.5)
      this.x = this.game.width - this.width * 0.5
  }

  shoot() {
    const projectile = this.game.getProjectile()
    if (projectile) projectile.start(this.x + this.width / 2, this.y)
  }

  restart() {
    this.x = this.game.width * 0.5 - this.width * 0.5
    this.y = this.game.height - this.height
    this.lives = 3
  }
}

class Projectile {
  constructor() {
    this.width = 8
    this.height = 20
    this.x = 0
    this.y = 0
    this.speed = 20
    this.free = true
  }

  draw(context) {
    if (!this.free) {
      context.fillRect(this.x, this.y, this.width, this.height)
    }
  }

  update() {
    if (!this.free) {
      this.y -= this.speed

      if (this.y < -this.height) this.reset()
    }
  }

  start(x, y) {
    this.x = x - this.width * 0.5
    this.y = y
    this.free = false
  }

  reset() {
    this.free = true
  }
}

class Enemy {
  constructor(game, positionX, positionY) {
    this.game = game
    this.width = this.game.enemySize
    this.height = this.game.enemySize
    this.x = 0
    this.y = 0
    this.positionX = positionX
    this.positionY = positionY
    this.markedForDeletion = false
  }

  draw(context) {
    context.strokeRect(this.x, this.y, this.width, this.height)
  }

  update(x, y) {
    this.x = x + this.positionX
    this.y = y + this.positionY

    //check collision enemies - projectile
    this.game.projectilePool.forEach(projectile => {
      if (!projectile.free && this.game.checkCollision(this, projectile)) {
        this.markedForDeletion = true
        projectile.reset()
        if (!this.game.gameOver) this.game.score++
      }
    })

    // check collision enemies - player
    if (this.game.checkCollision(this, this.game.player)) {
      this.markedForDeletion = true
      if (!this.game.gameOver && this.game.score > 0) this.game.score--
      this.game.player.lives--
      if (this.game.player.lives < 1) this.game.gameOver = true
    }

    // lose condition
    if (this.y + this.height > this.game.height) {
      this.game.gameOver = true
      this.markedForDeletion = true
    }
  }
}

class Wave {
  constructor(game) {
    this.game = game
    this.width = this.game.columns * this.game.enemySize
    this.height = this.game.rows * this.game.enemySize
    this.x = 0
    this.y = -this.height
    this.speedX = 15
    this.speedY = 0
    this.enemies = []
    this.nextWaveTrigger = false
    this.create()
  }

  render(context) {
    if (this.y < 0) this.y += 5
    this.speedY = 0
    if (this.x < 0 || this.x > this.game.width - this.width) {
      this.speedX *= -1
      this.speedY = this.game.enemySize
    }
    this.x += this.speedX
    this.y += this.speedY
    this.enemies.forEach(enemy => {
      enemy.update(this.x, this.y)
      enemy.draw(context)
    })
    this.enemies = this.enemies.filter(enemy => !enemy.markedForDeletion)
  }

  create() {
    for (let y = 0; y < this.game.rows; y++) {
      for (let x = 0; x < this.game.columns; x++) {
        let enemyX = x * this.game.enemySize
        let enemyY = y * this.game.enemySize
        this.enemies.push(new Enemy(this.game, enemyX, enemyY))
      }
    }
  }
}

class Game {
  constructor(canvas) {
    this.canvas = canvas
    this.width = this.canvas.width
    this.height = this.canvas.height
    this.keys = []
    this.player = new Player(this)

    this.projectilePool = []
    this.numberOfProjectile = 10
    this.createProjectiles()
    this.fired = false

    this.columns = 2
    this.rows = 2
    this.enemySize = 60

    this.waves = []
    this.waves.push(new Wave(this))
    this.waveCount = 1

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

  render(context) {
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
        this.player.lives++
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
    for (let i = 0; i < this.player.lives; i++) {
      context.fillRect(20 + 10 * i, 100, 5, 20)
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

window.addEventListener('load', function () {
  const canvas = document.getElementById('canvas1')
  const ctx = canvas.getContext('2d')
  canvas.width = 600
  canvas.height = 800
  ctx.fillStyle = 'white'
  ctx.strokeStyle = 'white'
  ctx.lineWidth = 5
  ctx.font = '30px Impact'

  const game = new Game(canvas)
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    game.render(ctx)
    requestAnimationFrame(animate)
  }
  animate()
})
