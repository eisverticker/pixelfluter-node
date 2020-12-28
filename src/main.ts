import { ScreenDrawer } from './screen-drawer'
import { makeItCreep } from './snake.art'
import hasFlag from 'has-flag'
import { makeItRain } from './rain.art'

const port = 1234
const host = 'localhost';

(async function () {
  const screenDrawer = new ScreenDrawer(port, host, 1920, 1080)
  
  if (hasFlag('snake')) {
    await makeItCreep(screenDrawer)
  } else {
    await makeItRain(screenDrawer)
  }
})().then()
