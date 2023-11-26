class Wave {
  constructor(game) {
    this.game = game
    this.width = this.game.columns * (this.game.enemySize + this.game.enemyGap)
    this.height = this.game.rows * this.game.enemySize
    this.x = this.game.width * 0.5 - this.width * 0.5
    this.y = -this.height
    this.speedX = Math.random() < 0.5 ? -1 : 1
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
        let enemyX = x * (this.game.enemySize + this.game.enemyGap)
        let enemyY = y * this.game.enemySize
        this.enemies.push(new Beetlemorph(this.game, enemyX, enemyY))
      }
    }
  }
}
