const socket = io.connect('http://localhost:8000')

// * test

const roomInput = document.querySelector('.room__num')
const joinBtn = document.querySelector('.join')
const roomsBtn = document.querySelector('.rooms')
const messageForm = document.querySelector('.message__form')
const messageInput = document.querySelector('.message__input')
const myScreen = document.querySelector('.myscreen')
const createRoomBtn = document.querySelector('.create')

// create Room - roomcreate.pug
const roomCreateForm = document.querySelector('.room__create')
const title = document.querySelector('.title')
const description = document.querySelector('.description')
const userName = document.querySelector('.username')
const roomCreateButton = document.querySelector('.roomcreate__button')

// entered Room - room.pug
const enteredRoomForm = document.querySelector('.room__entered')

const MAX_OFFSET = 200
let myRoom = null

const attachMessage = (message) => {
    const messageBox = document.createElement('div')
    const randomHorizontal = Math.random() * MAX_OFFSET
    const randomVertical = Math.random() * MAX_OFFSET

    // Set relative locaiton of messageBox
    randomHorizontal > 100
        ? (messageBox.style.right = `${randomHorizontal - 100}px`)
        : (messageBox.style.left = `${randomHorizontal}px`)

    randomVertical > 100
        ? (messageBox.style.bottom = `${randomVertical - 100}px`)
        : (messageBox.style.top = `${randomHorizontal}px`)

    messageBox.className = 'messagebox'
    messageBox.innerText = message
    myScreen.appendChild(messageBox)
    setTimeout(() => {
        myScreen.removeChild(messageBox)
    }, 1000)
}

const getAllRooms = () => {
    console.log(socket.id)
    socket.emit('getRoom', socket.id)
}

const sendMessage = (message) => {
    // if(!myRoom) return;

    socket.emit('sendMessage', {
        user: socket.id,
        rn: myRoom || 'default',
        message: message,
    })
}
// -----

socket.on('connect', () => {
    console.log('서버에 연결됨')

    socket.on('getRoom', (payload) => {
        console.log('getRoomClient', payload)
    })

    socket.on('sendMessage', (payload) => {
        console.log(payload)
    })
    socket.on('enterRoom', (payload) => {
        myRoom = { ...payload }
        // display entered room
        enteredRoomForm.classList.remove('display__none')
    })
})

const joinRoom = (hn) => {
    if (myRoom) {
        // leave room
        socket.emit('leaveRoom', myRoom)
    }
    socket.emit('joinRoom', hn)
}

joinBtn.addEventListener('click', (e) => {
    e.preventDefault()
    const roomNum = roomInput.value
    console.log(roomInput)
    joinRoom(roomNum)
})

roomsBtn.addEventListener('click', (e) => {
    e.preventDefault()
    getAllRooms()
})

messageForm.addEventListener('submit', (e) => {
    e.preventDefault()
    if (messageInput.value.trim() === '') {
        messageInput.value = ''
        return
    }

    const message = messageInput.value
    messageInput.value = ''
    sendMessage(message)
    attachMessage(message)
})

// CreateRoom!

roomCreateButton.addEventListener('click', () => {
    createRoom(title.value, description.value, userName.value)
})

const createRoom = (title, description, username) => {
    const host = socket.id
    const roomInfo = {
        host,
        title,
        description,
        username,
        category: 'abc', // temp
        subCategory: ['s', 'u', 'b'], // temp
        roomId: String(Date.now()),
        createdAt: new Date().toDateString(),
        users: [host],
    }
    socket.emit('createRoom', roomInfo, () => {
        // create done -> change my room info & add enteredRoom form
        console.log('DONNE')
        myRoom = roomInfo
        enteredRoomForm.classList.remove('display__none')

        // handle ice candidate
        
    })
    roomCreateForm.classList.add('display__none')
}

createRoomBtn.addEventListener('click', () => {
    console.log('btnclick')
    roomCreateForm.classList.remove('display__none')
})
