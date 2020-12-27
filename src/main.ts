import Net from 'net'
const port = 1337
const host = 'localhost'

const client = new Net.Socket()
client.connect(
  { port: port, host: host }, function() {

    console.log('TCP connection established with the server.')
    
    for(let i = 0; i < 2000; i++) {
      for(let x = 0; x < 200; x++) {
        for (let y = 0; y < 200; y++) {
          client.write(`PX ${x} ${y} ffffff\n`)
        }
      }
    }
  })

client.on('data', function(chunk) {
  console.log(`Data received from the server: ${chunk.toString()}.`)
  client.end()
})

client.on('end', function() {
  console.log('Requested an end to the TCP connection')
})