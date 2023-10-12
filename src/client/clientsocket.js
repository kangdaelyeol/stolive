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
const myFace = document.getElementById('myFace')
const muteBtn = document.getElementById('mute')
const cameraBtn = document.getElementById('camera')
const camerasSelect = document.getElementById('cameras')
const call = document.getElementById('call')

// ------ handling web rtc ----------
call.hidden = true

let myStream
let muted = false
let cameraOff = false
let roomName
let myPeerConnection

const MAX_OFFSET = 200
let myRoom = null

async function getCameras() {
    try {
        const devices = await navigator.mediaDevices.enumerateDevices()
        const cameras = devices.filter((device) => device.kind === 'videoinput')
        const currentCamera = myStream.getVideoTracks()[0]
        cameras.forEach((camera) => {
            const option = document.createElement('option')
            option.value = camera.deviceId
            option.innerText = camera.label
            if (currentCamera.label === camera.label) {
                option.selected = true
            }
            camerasSelect.appendChild(option)
        })
    } catch (e) {
        console.log(e)
    }
}

async function getMedia(deviceId) {
    const initialConstrains = {
        audio: true,
        video: { facingMode: 'user' },
    }
    const cameraConstraints = {
        audio: true,
        video: { deviceId: { exact: deviceId } },
    }
    try {
        myStream = await navigator.mediaDevices.getUserMedia(
            deviceId ? cameraConstraints : initialConstrains,
        )
        myFace.srcObject = myStream
        if (!deviceId) {
            await getCameras()
        }
    } catch (e) {
        console.log(e)
    }
}

function handleMuteClick() {
    myStream
        .getAudioTracks()
        .forEach((track) => (track.enabled = !track.enabled))
    if (!muted) {
        muteBtn.innerText = 'Unmute'
        muted = true
    } else {
        muteBtn.innerText = 'Mute'
        muted = false
    }
}

function handleCameraClick() {
    myStream
        .getVideoTracks()
        .forEach((track) => (track.enabled = !track.enabled))
    if (cameraOff) {
        cameraBtn.innerText = 'Turn Camera Off'
        cameraOff = false
    } else {
        cameraBtn.innerText = 'Turn Camera On'
        cameraOff = true
    }
}

async function handleCameraChange() {
    await getMedia(camerasSelect.value)
    if (myPeerConnection) {
        const videoTrack = myStream.getVideoTracks()[0]
        const videoSender = myPeerConnection
            .getSenders()
            .find((sender) => sender.track.kind === 'video')
        videoSender.replaceTrack(videoTrack)
    }
}

muteBtn.addEventListener('click', handleMuteClick)
cameraBtn.addEventListener('click', handleCameraClick)
camerasSelect.addEventListener('input', handleCameraChange)

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

// RTC Code

function makeConnection() {
    myPeerConnection = new RTCPeerConnection()
    myPeerConnection.addEventListener('icecandidate', handleIce)
    myPeerConnection.addEventListener('addstream', handleAddStream)
    myStream
        .getTracks()
        .forEach((track) => myPeerConnection.addTrack(track, myStream))
}

function handleIce(data) {
    console.log('sent candidate')
    socket.emit('ice', data.candidate, roomName)
}

function handleAddStream(data) {
    const peerFace = document.getElementById('peerFace')
    peerFace.srcObject = data.stream
}

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
