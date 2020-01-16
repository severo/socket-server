const express = require('express')
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)
const port = process.env.PORT || 3000
const rnd = require('randomcolor')

// TODO: add a public page that redirects to the GitHub repository
// app.use(express.static(__dirname + '/public'))

const chat = io.on('connection', socket => {
  socket.on('chat', data => {
    // console.log(`Message received: ${data}`)
    socket.broadcast.emit('chat', data)
  })
})

let guests = []
const occupappBeta = io.of('/occupapp-beta').on('connection', socket => {
  console.log('New occupapp user connected')
  socket.on('new-guest', (guest, ack) => {
    guest.name = guest.name || `Guest_${new Date().getTime()}`
    guest.sId = socket.id
    guest.color = rnd({ luminosity: 'dark' })
    guests.push(guest)
    io.of('/occupapp-beta').emit('list-guests', guests)
    ack(guest)
  })
  socket.on('bye-bye', _ => {
    guests = guests.filter(e => e.sId !== socket.id)
    io.of('/occupapp-beta').emit('list-guests', guests)
  })
})

http.listen(port, () => console.log('listening on port ' + port))
