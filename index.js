import express from 'express'
import http from 'http'
import { fileURLToPath } from 'url'
import { join, dirname } from 'path'
import { rooms, getAllRooms } from './db.js'
import { postUserLogin, postCheckJwt } from './controllers/controller.js'
import './mongo/mongodb.js'

// import fs from 'fs'
import cors from 'cors'
import userRouter from './routers/userRouter.js'
import profileRouter from './routers/profileRouter.js'
import roomRouter from './routers/roomRouters.js'
import IoServer from './io.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const PORT = 8000

const app = express()

app.set('view engine', 'pug')
app.set('views', join(__dirname, 'src', 'view'))

// middleWare
app.use('/client', express.static(join(__dirname, 'src', 'client')))
app.use('/uploads', express.static(join(__dirname, 'uploads')))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors())

const server = http.createServer(app)
const io = IoServer(server)

app.get('/', (req, res, next) => {
    const rooms = getAllRooms()
    res.render('main', { rooms })
})

app.get('/room/:id', (req, res, next) => {
    const rid = req.params.id
    const rinfo = rooms[`${rid}`]
    console.log(rinfo)
    if (!rinfo) return res.redirect('/')
    else res.render('room', { ...rinfo })
})

app.use('/user', userRouter)
app.use('/profile', profileRouter)
app.use('/room', roomRouter)
app.post('/login', postUserLogin)
app.post('/checkjwt', postCheckJwt)

app.get('/*', (req, res, next) => {
    return res.send('123')
})

server.listen(PORT, '0.0.0.0', () => {
    console.log('connection ghffltlt! - PORT:', PORT)
})
