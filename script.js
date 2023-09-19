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
      shoot: ' '
    }
  }

  draw(context) {
    context.fillRect(this.x, this.y, this.height, this.width)
  }

  update() {
    // horizontal movement
    if (this.game.hasKey(this.controls.right)) this.x += this.speed
    if (this.game.hasKey(this.controls.left)) this.x -= this.speed

    // horizontal boundaries restrictions
    if (this.x < -this.width * 0.5) this.x =  -this.width * 0.5
    else if (this.x > this.game.width - this.width * 0.5)
      this.x = this.game.width - this.width * 0.5
  }

  shoot() {
    const projectile = this.game.getProjectile()
    if (projectile) projectile.start(this.x + this.width / 2, this.y)
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

class Enemy {}

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
    console.log(this.projectilePool)

    window.addEventListener('keydown', e => {
      console.log(e)
      if (this.keys.indexOf(e.key) === -1) this.keys.push(e.key)
      if (e.key === this.player.controls.shoot) this.player.shoot()
    })

    window.addEventListener('keyup', e => {
      const keyIndex = this.keys.indexOf(e.key)
      if (keyIndex !== -1) this.keys.splice(keyIndex, 1)
    })
  }

  render(context) {
    this.player.draw(context)
    this.player.update()
    this.projectilePool.forEach(projectile => {
      projectile.update()
      projectile.draw(context)
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

  hasKey(key) {
    return this.keys.indexOf(key) !== -1
  }
}

window.addEventListener('load', function () {
  const canvas = document.getElementById('canvas1')
  const ctx = canvas.getContext('2d')
  canvas.width = 600
  canvas.height = 800

  const game = new Game(canvas)
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    game.render(ctx)
    requestAnimationFrame(animate)
  }
  animate()
})
