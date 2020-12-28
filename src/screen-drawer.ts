import Net from 'net'
import { Color } from './colors'

export class Pixel {
  constructor (private x: number, private y: number, private color?: string) {}
  
  getX(): number {
    return this.x
  }
  
  getY(): number {
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
  
export class ScreenDrawer {
    public client: Net.Socket
  
    constructor(private port: number, private host: string, public screenWidth: number, public screenHeight: number) {
      this.client = new Net.Socket()
      this.client.on('data', (_chunk) => {
        this.client.end()
      })
      
      this.client.on('end', function() {
        console.log('Requested an end to the TCP connection')
      })
    }
  
    drawBackground(color = Color.WHITE): ScreenDrawer {
      this.drawRectangle(0, 0, this.screenWidth, this.screenHeight, color)
      return this
    }
  
    drawRectangle(xOffset: number, yOffset: number, width: number, height: number, color = Color.RED): ScreenDrawer {
      const rounds = 1
  
      for(let i = 0; i < rounds; i++) {
        for(let x = 0; x < width; x++) {
          for (let y = 0; y < height; y++) {
            const pixel = new Pixel(x + Math.trunc(xOffset), y + Math.trunc(yOffset), color)
            this.client.write(pixel.toCommand() + '\n')
          }
        }
      }

      return this
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