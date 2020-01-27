import http from 'http'
import express from 'express'
import socketIo from 'socket.io'
import { Socket } from './socket.io/socket'

// TODO: add a public page that redirects to the GitHub repository
// app.use(express.static(__dirname + '/public'))

const port: number = +process.env.PORT || 3000
const app: express.Application = express()
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  )
  next()
})
const server = http.createServer(app)
const io = socketIo(server)
const socketServer = new Socket(io)

if (require.main === module) {
  socketServer.connect()
  server.listen(port)
}

// export the server so it can be easily called for testing
export { server, socketServer }
