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
  let clientSocket: SocketIOClient.Socket
  // let socketIds: SocketIOClient.Socket['id'][]

  beforeEach(async function() {
    socketServer.connect()
    server.listen('3001')
    clientSocket = ioc('http://localhost:3001/', ioOptions)
    // socketIds = await Promise.all([
    //   new Promise(resolve => {
    //     clientSocket.on('connect', () => {
    //       resolve(clientSocket.id)
    //     })
    //   }),
    //   new Promise(resolve => {
    //     io.on('connection', (socket: SocketIOClient.Socket) => {
    //       resolve(socket.id)
    //     })
    //   }),
    // ])
  })
  afterEach(function(done) {
    clientSocket.disconnect()
    server.close()

    done()
  })

  // it('should use the same socket id clientside and serverside', function() {
  //   return expect(socketIds[0]).to.equal(socketIds[1])
  // })

  it('should update the user profile on "update-profile" event', function() {
    // TODO: DOES NOT WORK AT ALL!!! NEVER EXECUTED
    const name = 'test'
    const color = '#888888'
    clientSocket.emit('update-profile', { name, color }, (result: any) => {
      expect(result).to.have.property('status')
      expect(result.status).to.equal('success')
      expect(result).to.have.property('data')
      expect(result.data).to.have.property('name')
      expect(result.data.name).to.equal(name)
      expect(result.data).to.have.property('color')
      expect(result.data.color).to.equal(color)
    })
  })
})
