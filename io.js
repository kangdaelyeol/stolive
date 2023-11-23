import { Server } from 'socket.io'
import { leaveRoom, joinRoom } from './db.js'

export default function IoServer(server) {
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


        // webRTC control

        socket.on('join_room', (roomName, userSid, userdata) => {
            if (!userdata) return
            const userData = JSON.parse(userdata)
            console.log('joinRoom', socket.id)
            socket.join(roomName)
            socket.join(`${roomName}${socket.id}`)
            // 들어간 방 / 내 정보 등록
            socket.data.roomName = roomName
            socket.data.userSid = userSid
            socket.data.userName = userData.userName
            // 룸 db정보 등록
            const result = joinRoom(roomName, userSid, userData.userName)
            console.log(result)
            if (!result) {
                socket.leave(roomName)
                socket.leave(`${roomName}${socket.id}`)
                return socket.to(roomName).emit('welcome', false)
            } else {
                console.log('send welcome to', socket.id)
                socket.to(roomName).emit('welcome', socket.id, userdata)
            }
        })
        socket.on('offer', (offer, receiverName, receiverdata) => {
            // 상대방 번호에 offer를 보내고 param으로 내 id 주기
            console.log('offer-receiverName:', receiverName, receiverdata)
            console.log('myName:', socket.id)

            socket
                .to(receiverName)
                .emit('offer', offer, socket.id, receiverdata)
        })
        socket.on('answer', (answer, receiverName) => {
            console.log('answer-receiverName:', receiverName)
            console.log('myName:', socket.id)
            socket.to(receiverName).emit('answer', answer, socket.id)
        })
        socket.on('ice', (ice, receiverName) => {
            socket.to(receiverName).emit('ice', ice, socket.id)
        })

        socket.on('message', (roomName, message, cb) => {
            socket.to(roomName).emit('message', message)
            cb()
        })
    })
    return io
}
