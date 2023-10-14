import express from 'express'
import http from 'http'
import https from 'https'
import { Server } from 'socket.io'
import { fileURLToPath } from 'url'
import { join, dirname } from 'path'
import { rooms, createRoom } from './db.js'
import fs from 'fs'

// https SSL/TLS pem
const privateKey = fs.readFileSync('./key.pem', 'utf8')
const certificate = fs.readFileSync('./cert.pem', 'utf8')
const credentials = { key: privateKey, cert: certificate, passphrase: 'eoduf3' }

// sids: Map<SocketId, Set<Room>>
// rooms: Map<Room, Set<SocketId>>

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const PORT = 8000

const app = express()
app.set('view engine', 'pug')
app.set('views', join(__dirname, 'src', 'view'))

app.use('/client', express.static(join(__dirname, 'src', 'client')))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const server = http.createServer( app)
const io = new Server(server)

io.on('connection', (socket) => {
    // for Test
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

    // webRTC control
    socket.on('join_room', (roomName) => {
        console.log('join_Room!', roomName)
        socket.join(roomName)
        socket.to(roomName).emit('welcome')
    })
    socket.on('offer', (offer, roomName) => {
        socket.to(roomName).emit('offer', offer)
    })
    socket.on('answer', (answer, roomName) => {
        socket.to(roomName).emit('answer', answer)
    })
    socket.on('ice', (ice, roomName) => {
        socket.to(roomName).emit('ice', ice)
    })
})

app.get('/', (req, res, next) => {
    const roomInfo = []
    Object.keys(rooms).forEach((k) => {
        roomInfo.push({ ...rooms[`${k}`] })
    })
    res.render('main', { rooms })
})

app.post('/find', (req, res, next) => {
    console.log(req.body)
    return res.json(rooms[`${req.body.rn}`])
})

app.post('/search', (req, res, next) => {
    const query = req.body
    const { keyword, category } = query
    if (!keyword && !category) return res.status(200).json({ ...rooms })
})

app.post('/create', (req, res, next) => {
    const query = req.body
    const { title, description, category, subCategory, userName } = query
    console.log(query)
    const result = createRoom(
        title,
        description,
        userName,
        category,
        subCategory,
    )
    if (result) return res.json(result)
    else return res.end()
})

app.get('/room/:id', (req, res, next) => {
    const rid = req.params.id
    const rinfo = rooms[`${rid}`]
    console.log(rinfo)
    if (!rinfo) return res.redirect('/')
    else res.render('room', { ...rinfo })
})

app.get('/*', (req, res, next) => {
    return res.send('123')
})

server.listen(PORT, () => {
    console.log('TLqkfazjsprtus')
})

// Handling webRTC
