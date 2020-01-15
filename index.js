const express = require('express')
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)
const port = process.env.PORT || 3000

// TODO: add a public page that redirects to the GitHub repository
// app.use(express.static(__dirname + '/public'))

function onConnection(socket) {
  socket.on('chat', data => {
    // console.log(`Message received: ${data}`)
    socket.broadcast.emit('chat', data)
  })
}

io.on('connection', onConnection)

http.listen(port, () => console.log('listening on port ' + port))
