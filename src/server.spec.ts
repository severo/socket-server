import ioc from 'socket.io-client'
import { expect } from 'chai'
import { server, socketServer } from './server'

process.env.NODE_ENV = 'test'

const ioOptions = {
  transports: ['websocket'],
  forceNew: true,
  reconnection: false,
}

describe('/occupapp-beta', function() {
  let client: SocketIOClient.Socket

  beforeEach(async function() {
    socketServer.connect()
    server.listen('3001')
    client = ioc('http://localhost:3001/occupapp-beta', ioOptions)
  })
  afterEach(function(done) {
    client.disconnect()
    server.close()

    done()
  })

  it('should connect socket', async () => {
    await new Promise(resolve => client.on('connect', resolve))
    expect(client.connected).to.be.true
  })
})
