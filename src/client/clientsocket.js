const socket = io.connect('http://localhost:8000')

// * test

const roomInput = document.querySelector('.room__num')
const joinBtn = document.querySelector('.join')
const roomsBtn = document.querySelector('.rooms')
let myRoom = null

const getAllRooms = () => {
    console.log(socket.id)
    socket.emit('getRoom', socket.id)
}

// -----

socket.on('connect', () => {
    console.log('서버에 연결됨')
    socket.on('getRoom', (payload) => {
        console.log('getRoomClient', payload)
    })
})


const joinRoom = (name) => {
    if (myRoom) {
        // leave room
        socket.emit('leaveRoom', myRoom)
    }
    myRoom = name
    socket.emit('joinRoom', name)
}

joinBtn.addEventListener('click', (e) => {
    e.preventDefault()
    const roomNum = roomInput.value
    console.log(roomInput)
    joinRoom(roomNum)
})

roomsBtn.addEventListener('click', () => {
    e.preventDefault()
    getAllRooms()
})
