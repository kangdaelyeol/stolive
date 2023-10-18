import express from 'express'
import http from 'http'
import https from 'https'
import { Server } from 'socket.io'
import { fileURLToPath } from 'url'
import { join, dirname } from 'path'
import {
    rooms,
    createRoom,
    leaveRoom,
    getRoomsByQuery,
    getAllRooms,
    updateRoom,
    joinRoom,
} from './db.js'
// import fs from 'fs'
import cors from 'cors'

// https SSL/TLS pem
// const privateKey = fs.readFileSync('./key.pem', 'utf8')
// const certificate = fs.readFileSync('./cert.pem', 'utf8')
// const credentials = { key: privateKey, cert: certificate, passphrase: 'eoduf3' }

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
app.use(cors())

const server = http.createServer(app)
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    },
})

io.on('connection', (socket) => {
    console.log('connection', socket.id)
    socket.on('error', (err) => {
        if (err && err.message === 'unauthorized event') {
            socket.disconnect()
        }
    })

    // Client

    socket.on('disconnecting', (reason) => {
        console.log(
            'disconnecting',
            socket.id,
            socket.data.roomName,
            socket.data.userName,
        )
        leaveRoom(
            socket.data.roomName,
            socket.data.userSid,
            socket.data.userName,
        )
        io.emit('willleave', socket.id, socket.rooms)
    })

    socket.on('message', (roomName, senderId, message) => {
        console.log('message', senderId, message)
        socket.to(roomName).emit('message', senderId, message)
    })

    // webRTC control

    socket.on('join_room', (roomName, userSid, userName) => {
        console.log('joinRoom', socket.id)
        socket.join(roomName)
        socket.join(`${roomName}${socket.id}`)
        // 들어간 방 / 내 정보 등록
        socket.data.roomName = roomName
        socket.data.userSid = userSid
        socket.data.userName = userName
        // 룸 db정보 등록
        const result = joinRoom(roomName, userSid, userName)
        if (!result) {
            socket.leave(roomName)
            socket.leave(`${roomName}${socket.id}`)
            return socket.to(roomName).emit('welcome', false)
        } else
        socket.to(roomName).emit('welcome', socket.id)
    })
    socket.on('offer', (offer, receiverName) => {
        // 상대방 번호에 offer를 보내고 param으로 내 id 주기
        console.log('offer-receiverName:', receiverName)
        console.log('myName:', socket.id)

        socket.to(receiverName).emit('offer', offer, socket.id)
    })
    socket.on('answer', (answer, receiverName) => {
        console.log('answer-receiverName:', receiverName)
        console.log('myName:', socket.id)
        socket.to(receiverName).emit('answer', answer, socket.id)
    })
    socket.on('ice', (ice, receiverName) => {
        socket.to(receiverName).emit('ice', ice, socket.id)
    })
})

// - main / searchAPI

app.get('/', (req, res, next) => {
    const rooms = getAllRooms()
    res.render('main', { rooms })
})

app.post('/search', (req, res, next) => {
    const query = req.body
    const { keyword, category, subCategory } = query
    const data = getRoomsByQuery(keyword, category, subCategory)
    return res.status(200).json(data)
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
    if (result) return res.status(200).json(result)
    else return res.end()
})

app.post('/leave', (req, res, next) => {
    const query = req.body
    const { roomId, userName } = query
    leaveRoom(roomId, userName)
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

server.listen(PORT, '0.0.0.0', () => {
    console.log('TLqkfazjsprtus')
})
