import { randomInt } from 'crypto'
import { confettiColors, Color } from './colors'
import { ScreenDrawer } from './screen-drawer'

export async function makeItRain (screenDrawer: ScreenDrawer): Promise<void> {
  console.log('Starting a wave of rain drops')
    
  function initDrops(count: number, screenWidth: number) {
    const drops = []
    for (let i = 0; i < count; i++) {
      drops.push({ x: randomInt(0, screenWidth), yOffset: randomInt(0, 800), color: confettiColors[randomInt(0, confettiColors.length-1)]})
    }
    return drops
  }
    
  const height = 10
  const width = 6
  const numOfDrops = 80
  const speed = 6
  const backgroundColor = Color.WHITE
  const secondaryForegroundColor = Color.WHITE
  
  await screenDrawer.start()
  
  
  let rainDistance = 0
  let drops = initDrops(numOfDrops, screenDrawer.screenWidth)
  screenDrawer.drawBackground(backgroundColor)
  
  setTimeout(() => {
    while (true) {
      // draw drops
      drops.forEach(
        (drop) => {
          screenDrawer.drawRectangle(drop.x, rainDistance + drop.yOffset, width, height, drop.color)
        } 
      )
      // clean up drops
      drops.forEach(
        (drop) => {
          screenDrawer.drawRectangle(drop.x, rainDistance + drop.yOffset, width, height, secondaryForegroundColor)
        } 
      )
      rainDistance += speed 
      
      if (rainDistance >= screenDrawer.screenWidth - 300) {
        rainDistance = randomInt(0, 20)
        drops = initDrops(randomInt(numOfDrops, numOfDrops + 5), screenDrawer.screenWidth)
      }
    }
  }, 1)
}