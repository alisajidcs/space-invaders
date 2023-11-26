class Beetlemorph extends Enemy {
  constructor(game, positionX, positionY) {
    super(game, positionX, positionY)
    this.image = document.getElementById('beetlemorph')
    this.frameX = 0
    this.maxFrame = 2
    this.frameY = Math.floor(Math.random() * 4)
    this.lives = 3
    this.maxLives = this.lives
  }
}
