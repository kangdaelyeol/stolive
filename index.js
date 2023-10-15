import express from 'express'
import http from 'http'
import https from 'https'
import { Server } from 'socket.io'
import { fileURLToPath } from 'url'
import { join, dirname } from 'path'
import { rooms, createRoom } from './db.js'
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

    socket.on('disconnecting', (reason) => {
        io.emit('willleave', socket.id)
    })

    // webRTC control

    socket.on('join_room', (roomName) => {
        console.log('join_Room!', roomName)
        socket.join(roomName)
        socket.join(`${roomName}${socket.id}`)
        socket.to(roomName).emit('welcome', socket.id)
    })
    socket.on('offer', (offer, receiverName) => {
        // 상대방 번호에 offer를 보내고 param으로 내 id 주기
        socket.to(receiverName).emit('offer', offer, socket.id)
    })
    socket.on('answer', (answer, receiverName) => {
        socket.to(receiverName).emit('answer', answer, socket.id)
    })
    socket.on('ice', (ice, receiverName) => {
        socket.to(receiverName).emit('ice', ice, socket.id)
    })
})

// - main / searchAPI

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
