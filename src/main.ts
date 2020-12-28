import Net from 'net'
const port = 1234
const host = 'localhost'

const Color = {
  RED: 'ff0000',
  GREEN: '00ff00',
  WHITE: 'ffffff',
  BLUE: '0000ff',
  LIGHTBLUE: 'ADD8E6',
  LIGHTPINK: 'FFB6C1'
}

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

  start (callback: any) {
    this.client.connect({ port: this.port, host: this.host }, callback)
    this.client.on('data', function(chunk) {
      // console.log(`Incoming: ${chunk.toString()}.`)
      client.end()
    })
    
    this.client.on('end', function() {
      console.log('Requested an end to the TCP connection')
    })
  }
}

const client = new Net.Socket()
const screenDrawer = new ScreenDrawer(port, host, 1920, 1080)

function initDrops(count: number, screenWidth: number) {
  const drops = []
  for (let i = 0; i < count; i++) {
    drops.push({ x: randomInt(0, screenWidth), yOffset: randomInt(0, 30)})
  }
  return drops
}

screenDrawer.start(() => {
  const height = 10
  const width = 3
  const numOfDrops = 100
  const speed = 3
  const backgroundColor = Color.WHITE
  const foregroundColor = Color.BLUE
  const secondaryForegroundColor = Color.WHITE

  let rainDistance = 0
  let drops = initDrops(numOfDrops, screenDrawer.screenWidth)
  screenDrawer.drawBackground(backgroundColor)

  while (true) {
    drops.forEach(
      (drop) => {
        screenDrawer.drawRectangle(drop.x, rainDistance + drop.yOffset, width, height, foregroundColor)
      } 
    )
    // 
    drops.forEach(
      (drop) => {
        screenDrawer.drawRectangle(drop.x, rainDistance + drop.yOffset, width, height, secondaryForegroundColor)
      } 
    )
    rainDistance += speed 

    if (rainDistance >= screenDrawer.screenWidth) {
      rainDistance = randomInt(0, 20)
      drops = initDrops(randomInt(numOfDrops, numOfDrops + 5), screenDrawer.screenWidth)
    }
  }
})
