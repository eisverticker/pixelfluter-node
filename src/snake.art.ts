import { randomInt } from 'crypto'
import { snakeColors, Color } from './colors'
import { ScreenDrawer } from './screen-drawer'

export async function makeItCreep (screenDrawer: ScreenDrawer): Promise<void> {
  const size = 15
  await screenDrawer.start()
  let position = {
    x: 0.0,
    y: randomInt(0, screenDrawer.screenHeight - (size * 2.0)) * 1.0
  }
  
  const acceleration = 0.05
  const redrawOffset = randomInt(20, 40)
  const maxSpeed = 8.0
  let speed = 0.0
  const direction = {
    x: randomInt(0, 10)/10,
    y: randomInt(0, 10)/10
  }
  const color = snakeColors[randomInt(0, snakeColors.length - 1)]
  
  const drawPositionHistory: Array<any> = []
  
  setTimeout(() => {
    while (true) {
      // draw
      screenDrawer.drawRectangle(position.x, position.y, size, size, color)
      drawPositionHistory.push(Object.assign({}, position))
  
      // remove previous drawings
      if (drawPositionHistory.length > redrawOffset) {
        const oldPosition = drawPositionHistory.shift()
        screenDrawer.drawRectangle(oldPosition.x, oldPosition.y, size, size, Color.WHITE)
      }
  
      speed = Math.min(speed + acceleration, maxSpeed)
      position = {
        x: position.x + (direction.x * speed),
        y: position.y + (direction.y * speed),
      }
  
      // right bounds
      if (position.x + size > screenDrawer.screenWidth) {
        speed = 0
        direction.x = -direction.x
        position.x = screenDrawer.screenWidth - size - 1
      }
  
      // left bounds
      if (position.x < 0) {
        speed = 0
        direction.x = -direction.x
        position.x = 1
      }
  
      // bottom bounds
      if (position.y + size > screenDrawer.screenHeight) {
        speed = 0
        direction.y = -direction.y
        position.y = screenDrawer.screenHeight - size - 1
      }
  
      // top bounds
      if (position.y < 0) {
        speed = 0
        direction.y = -direction.y
        position.y = 1
      }
    }
  }, 1)
}