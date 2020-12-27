import Net from 'net'
const port = 1234
const host = 'localhost'

const Color = {
  RED: 'ff0000',
  GREEN: '00ff00',
  WHITE: 'ffffff',
  BLUE: '0000ff',
  LIGHTBLUE: 'ADD8E6'
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

  constructor(private port: number, private host: string) {
    this.client = new Net.Socket()
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
const screenDrawer = new ScreenDrawer(port, host)

function initDrops(count: number) {
  const drops = []
  for (let i = 0; i < count; i++) {
    drops.push({ x: randomInt(0, 1920), yOffset: randomInt(0, 30)})
  }
  return drops
}

screenDrawer.start(() => {
  const height = 20
  const width = 4
  let rainDistance = 0
  const numOfDrops = 20
  let drops = initDrops(numOfDrops)

  const backgroundColor = Color.WHITE
  const foregroundColor = Color.BLUE
  const secondaryForegroundColor = Color.LIGHTBLUE

  screenDrawer.drawRectangle(0, 0, 1920, 1080, backgroundColor)

  while (true) {
    drops.forEach(
      (drop) => {
        screenDrawer.drawRectangle(drop.x, rainDistance + drop.yOffset, width, height, foregroundColor)
      } 
    )
    drops.forEach(
      (drop) => {
        screenDrawer.drawRectangle(drop.x, rainDistance + drop.yOffset, width, height, secondaryForegroundColor)
      } 
    )
    rainDistance += 2

    if (rainDistance >= 1920) {
      rainDistance = randomInt(0, 20)
      drops = initDrops(randomInt(numOfDrops, numOfDrops + 5))
    }
  }
})
