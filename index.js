import express from 'express'
import http from 'http'
import { Server } from 'socket.io'
import { fileURLToPath } from 'url'
import { join, dirname } from 'path'
import { getRandomBase64String } from './src/server/fact.js'

// sids: Map<SocketId, Set<Room>>
// rooms: Map<Room, Set<SocketId>>

/**
  room: {
    <id>: {
        roomId: String
        title: String
        description: String
        host: <socket.id>
        users: [socket.id]
        category: String
        subCategory: [String]
        createdAt:String
    }
   }
 */

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const PORT = 8000
const rooms = []

const app = express()
app.set('view engine', 'pug')
app.set('views', join(__dirname, 'src', 'view'))

app.use('/client', express.static(join(__dirname, 'src', 'client')))

const server = http.createServer(app)
const io = new Server(server)

io.on('connection', (socket) => {
    console.log('connection', socket.id)
    socket.on('error', (err) => {
        if (err && err.message === 'unauthorized event') {
            socket.disconnect()
        }
    })

    socket.on('disconnect', (reason) => {
        console.log(reason)
    })

    socket.on('getRoom', (id) => {
        console.log('onGetRoom', id)
        socket.emit('getRoom', rooms)
    })

    socket.on('joinRoom', (payLoad) => {
        const rId = getRandomBase64String(30)
        socket.join(rId)
        console.log(socket.rooms)
    })

    socket.on('leaveRoom', (rn) => {
        socket.leave(rn)
    })
})

app.get('/', (req, res, next) => {
    res.render('main')
})

server.listen(PORT, () => {
    console.log('TLqkfazjsprtus')
})

const getRooms = (socket) => {
    console.log(socket.id)
    console.log(socket.rooms)
}

const joinRoom = (socket, id) => {
    socket.join(id)
}
