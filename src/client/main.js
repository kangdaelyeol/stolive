const socket = io.connect('http://localhost:8000')

// * test

const roomInput = document.querySelector('.room__num')
const joinBtn = document.querySelector('.join')
const roomsBtn = document.querySelector('.rooms')

const createRoomBtn = document.querySelector('.create')

// create Room - roomcreate.pug
const roomCreateForm = document.querySelector('.room__create')
const title = document.querySelector('.title')
const description = document.querySelector('.description')
const userName = document.querySelector('.username')
const roomCreateButton = document.querySelector('.roomcreate__button')

const MAX_OFFSET = 200
let myRoom = null

// Socket Code

socket.on('welcome', async () => {
    const offer = await myPeerConnection.createOffer()
    myPeerConnection.setLocalDescription(offer)
    console.log('sent the offer')
    socket.emit('offer', offer, roomName)
})

socket.on('offer', async (offer) => {
    console.log('received the offer')
    myPeerConnection.setRemoteDescription(offer)
    const answer = await myPeerConnection.createAnswer()
    myPeerConnection.setLocalDescription(answer)
    socket.emit('answer', answer, roomName)
    console.log('sent the answer')
})

socket.on('answer', (answer) => {
    console.log('received the answer')
    myPeerConnection.setRemoteDescription(answer)
})

socket.on('ice', (ice) => {
    console.log('received candidate')
    myPeerConnection.addIceCandidate(ice)
})

// ----------------------- handling web rtc ---------------------

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

const getAllRooms = async () => {
    const result = await fetch('/search', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
    })
    const data = await result.json()
    console.log(data)
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

const joinRoom = async (rn) => {
    // if (myRoom) {
    //     // leave room
    //     socket.emit('leaveRoom', myRoom)
    // }
    const roomInfo = await fetch(`/find`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            rn,
        }),
    })
    console.log(roomInfo)
    myRoom = { ...roomInfo }
    socket.emit('joinRoom', rn)
}

joinBtn.addEventListener('click', (e) => {
    e.preventDefault()
    const roomNum = roomInput.value
    joinRoom(roomNum)
})

roomsBtn.addEventListener('click', (e) => {
    e.preventDefault()
    getAllRooms()
})

// CreateRoom!

roomCreateButton.addEventListener('click', async () => {
    await createRoom(title.value, description.value, userName.value)
})

const createRoom = async (
    title,
    description,
    userName,
    category,
    subCategory,
) => {
    const result = await fetch('/create', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            title,
            description,
            userName,
            category,
            subCategory,
        }),
    })

    roomCreateForm.classList.add('display__none')
    const data = await result.json()
    console.log(data)
    window.location.href = '/room/' + data.roomId
}

createRoomBtn.addEventListener('click', () => {
    console.log('btnclick')
    roomCreateForm.classList.remove('display__none')
})
