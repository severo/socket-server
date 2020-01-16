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

const guests = new Map()
const setGuest = g => guests.set(g.sId, g)
const deleteGuest = id => guests.delete(id)
const getGuestsArray = () => [...guests.values()]
const timestamp = guest => {
  const t = Date.now()
  setGuest({ ...guest, updatedDate: t, expirationDate: t + 1000 * 60 * 10 })
}
const emitListGuests = () => {
  // Clean the list, pruning guests that are inactive for more than 10min
  const now = Date.now()
  for ([id, g] of guests) {
    if (!g.updatedDate || g.expirationDate < now) {
      deleteGuest(id)
    }
  }
  io.of('/occupapp-beta').emit('list-guests', getGuestsArray())
}
const occupappBeta = io.of('/occupapp-beta').on('connection', socket => {
  console.log('New occupapp user connected')
  socket.on('new-guest', (guest, ack) => {
    guest.name = guest.name || `Guest_${now()}`
    guest.sId = socket.id
    guest.color = rnd({ luminosity: 'dark' })
    setGuest(guest)
    timestamp(guest)
    emitListGuests()
    ack(guest)
  })
  socket.on('bye-bye', _ => {
    deleteGuest(socket.id)
    emitListGuests()
  })
})

http.listen(port, () => console.log('listening on port ' + port))
