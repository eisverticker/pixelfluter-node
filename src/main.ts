import Net from 'net'
const port = 1234
const host = 'localhost'

const Color = {
  RED: 'ff0000',
  GREEN: '00ff00',
  WHITE: 'ffffff',
  BLUE: '0000ff',
  LIGHTBLUE: 'ADD8E6',
  PINK: 'FFC0CB',
  LIGHTPINK: 'FFB6C1',
  BLACK: '000000'
}


const confettiColors = [
  Color.RED,
  Color.GREEN,
  Color.PINK,
  Color.BLUE
]

function randomInt(min: number, max: number) {  
  return Math.floor(
    Math.random() * (max - min) + min
  )
}


class Pixel {
  constructor (private x: number, private y: number, private color?: string) {}

  getX() {
    return this.x
  }

  getY() {
    return this.y
  }

  getColor(): string | undefined {
    return this.color
  }

  toCommand (): string {
    return `PX ${this.x} ${this.y} ${this.color}`
  }

  static parseCommand(command: string): Pixel {
    const parts = command.split(' ')

    if (parts.length < 3) {
      throw new Error('failed to parse command ' + command + 'due to wrong format')
    }

    return new Pixel(parseInt(parts[1]), parseInt(parts[2]), parts[3])
  }

}

class ScreenDrawer {
  public client: Net.Socket

  constructor(private port: number, private host: string, public screenWidth: number, public screenHeight: number) {
    this.client = new Net.Socket()
    this.client.on('data', (chunk) => {
      // console.log(`Incoming: ${chunk.toString()}.`)
      this.client.end()
    })
    
    this.client.on('end', function() {
      console.log('Requested an end to the TCP connection')
    })
  }

  drawBackground(color = Color.WHITE) {
    this.drawRectangle(0, 0, this.screenWidth, this.screenHeight, color)
  }

  drawRectangle(xOffset: number, yOffset: number, width: number, height: number, color = Color.RED) {
    const rounds = 1

    for(let i = 0; i < rounds; i++) {
      for(let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
          const pixel = new Pixel(x + xOffset, y + yOffset, color)
          this.client.write(pixel.toCommand() + '\n')
        }
      }
    }
  }

  start (): Promise<void> {
    return new Promise(
      (resolve, _reject) => {
        this.client.connect({ port: this.port, host: this.host }, () => {
          resolve()
        })
      }
    )
  }
}

function sleep(milliseconds: number) {
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}

async function makeItBounce (screenDrawer: ScreenDrawer) {
  const size = 80
  await screenDrawer.start()
  let position = {
    x: 0,
    y: 0
  }

  const acceleration = 0.5
  const maxSpeed = 100
  let speed = 0
  const direction = {
    x: 0.5,
    y: 1
  }


  setTimeout(() => {
    while (true) {
      screenDrawer.drawRectangle(position.x, position.y, size, size, Color.BLACK)
      screenDrawer.drawRectangle(position.x, position.y, size, size, Color.WHITE)

      speed = Math.min(speed + acceleration, maxSpeed)
      position = {
        x: position.x + (direction.x * speed),
        y: position.y + (direction.y * speed),
      }

      // right bounds
      if (position.x + size > screenDrawer.screenWidth) {
        speed = 0
        direction.x = -direction.x
        position.x -= size
      }

      // left bounds
      if (position.x < 0) {
        speed = 0
        direction.x = -direction.x
        position.x += size
      }

      // bottom bounds
      if (position.y + size > screenDrawer.screenHeight) {
        speed = 0
        direction.y = -direction.y
        position.y -= size
      }

      // top bounds
      if (position.y < 0) {
        speed = 0
        direction.y = -direction.y
        position.y += size
      }
    }
  }, 1)
}
 
async function makeItRain (screenDrawer: ScreenDrawer) {
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



(async function () {
  const screenDrawer = new ScreenDrawer(port, host, 1920, 1080)
  // await makeItRain(screenDrawer)
  await makeItBounce(screenDrawer)
})().then()
