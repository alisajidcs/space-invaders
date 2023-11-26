class Player {
  constructor(game) {
    this.game = game
    this.width = 140
    this.height = 120
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
    this.maxLives = 10
    this.image = document.getElementById('player')
    this.jetsImage = document.getElementById('player_jets')
    this.frameX = 0
    this.jetsFrame = 1
  }

  draw(context) {
    // handle sprite frames
    if (this.game.hasKey(this.controls.shoot)) {
      this.frameX = 1
    } else {
      this.frameX = 0
    }
    context.drawImage(
      this.jetsImage,
      this.jetsFrame * this.width,
      0,
      this.width,
      this.height,
      this.x,
      this.y,
      this.width,
      this.height,
    )
    context.drawImage(
      this.image,
      this.frameX * this.width,
      0,
      this.width,
      this.height,
      this.x,
      this.y,
      this.width,
      this.height,
    )
  }

  update() {
    // horizontal movement
    if (this.game.hasKey(this.controls.right)) {
      this.x += this.speed
      this.jetsFrame = 0
    } else if (this.game.hasKey(this.controls.left)) {
      this.x -= this.speed
      this.jetsFrame = 2
    } else {
      this.jetsFrame = 1
    }

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
