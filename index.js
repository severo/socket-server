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

// state
const guests = new Map()
let urlQuerySpec = {}

const setGuest = g => guests.set(g.sId, g)
const deleteGuest = id => guests.delete(id)
const getGuestsArray = () => [...guests.values()]
const touch = guest => {
  const t = Date.now()
  setGuest({ ...guest, updatedDate: t, expirationDate: t + 1000 * 60 * 10 })
}
const onNewGuest = socket => (guest, ack) => {
  guest.sId = socket.id
  guest.name = guest.name || `Guest_${Date.now()}`
  guest.color = guest.color || rnd({ luminosity: 'dark' })
  setGuest(guest)
  touch(guest)
  emitListGuests()
  ack(guest, urlQuerySpec)
}
const onUpdateGuest = socket => (guest, ack) => {
  // Used to update the name or the color
  // For now, there is no difference with onNewGuest
  onNewGuest(socket)(guest, ack)
}
const onUpdateUrlQuerySpec = socket => (newUrlQuerySpec, ack) => {
  console.log('new urlQuerySpec')
  const guest = guests.get(socket.id)
  if (guest !== undefined) {
    touch(guest)
    urlQuerySpec = newUrlQuerySpec
    socket.broadcast.emit('urlqueryspec', urlQuerySpec)
    ack(urlQuerySpec)
  }
}
const onByeBye = socket => _ => {
  deleteGuest(socket.id)
  emitListGuests()
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
  socket.on('new-guest', onNewGuest(socket))
  socket.on('update-guest', onUpdateGuest(socket))
  socket.on('update-urlqueryspec', onUpdateUrlQuerySpec(socket))
  socket.on('bye-bye', onByeBye(socket))
})

http.listen(port, () => console.log('listening on port ' + port))
