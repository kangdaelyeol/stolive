import express from 'express'
import http from 'http'
import { Server } from 'socket.io'
import { fileURLToPath } from 'url'
import { join, dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const PORT = 8000

const app = express()
app.set('view engine', 'pug')
app.set('views', join(__dirname, 'src', 'view'))

app.use('/client', express.static(join(__dirname, 'src', 'client')))

const server = http.createServer(app)
const io = new Server(server)

io.on('connection', (socket) => {
    
  socket.on('yeal', (soc) => {
        console.log(soc)
    })

    
    socket.emit('dkdld', {
        abc: "socket",
    })
})

app.get('/', (req, res, next) => {
    res.render('main')
})

server.listen(PORT, () => {
    console.log('TLqkfazjsprtus')
})
