window.addEventListener('load', function () {
  const canvas = document.getElementById('canvas1')
  const ctx = canvas.getContext('2d')
  canvas.width = 600
  canvas.height = 800
  ctx.fillStyle = 'white'
  ctx.strokeStyle = 'white'
  ctx.font = '30px Impact'

  const game = new Game(canvas)

  let lastTime = 0
  function animate(timeStamp) {
    const deltaTime = timeStamp - lastTime
    lastTime = timeStamp
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    game.render(ctx, deltaTime)
    requestAnimationFrame(animate)
  }
  animate(0)
})
