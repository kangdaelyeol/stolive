import express from 'express'
import http from 'http'
import { Server } from 'socket.io'
import { fileURLToPath } from 'url'
import { join, dirname } from 'path'

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
const rooms = {}

const app = express()
app.set('view engine', 'pug')
app.set('views', join(__dirname, 'src', 'view'))

app.use('/client', express.static(join(__dirname, 'src', 'client')))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const server = http.createServer(app)
const io = new Server(server)

io.on('connection', (socket) => {
    // for Test
    socket.join('default')
    // >>>>>>

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

    socket.on('createRoom', (payload, done) => {
        //push room info into rooms
        const { roomId } = payload
        rooms[`${roomId}`] = {
            ...payload,
        }
        socket.join(roomId)
        socket.to(roomId).emit('enterRoom', { ...rooms[`${roomId}`] })
        console.log(rooms)
        done()
    })

    socket.on('joinRoom', (rn) => {
        socket.join(rn)

        rooms[`${rn}`].users.push(socket.id)

        console.log(socket.rooms)
    })

    socket.on('leaveRoom', (rn) => {
        socket.leave(rn)
        rooms[`${rn}`].users = rooms[`${rn}`]?.users.filter((v) => {
            return v === socket.id
        })

        // when the host leave
        // ---> change host
        if (rooms[`${rn}`].host === socket.id) {
            rooms[`${rn}`].host = rooms[`${rn}`].users[0]
        }

        // when the person leaving is the last user
        // ---> delete room
        if (rooms[`${rn}`].users.length === 0) {
            delete rooms[`${rn}`]
        }
    })

    socket.on('sendMessage', (payload) => {
        const { rn, message, user } = payload
        console.log(rn, message)
        socket.to(rn).emit('sendMessage', { message, user })
    })
})

app.get('/', (req, res, next) => {
    res.render('main')
})

app.post('/find', (req, res, next) => {
    console.log(req.body)
    return res.send.json(rooms[`${req.body.rn}`])
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
    socket.to(roomName).emit('welcome')
}

// Handling webRTC
