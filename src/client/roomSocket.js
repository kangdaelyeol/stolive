const socket = io.connect('http://localhost:8000')

// entered Room - room.pug
const enteredRoomForm = document.querySelector('.room__entered')
const myFace = document.getElementById('myFace')
const muteBtn = document.getElementById('mute')
const cameraBtn = document.getElementById('camera')
const camerasSelect = document.getElementById('cameras')
const call = document.getElementById('call')
const connectBtn = document.querySelector("#connect");

const messageForm = document.querySelector('.message__form')
const messageInput = document.querySelector('.message__input')
const myScreen = document.querySelector('.myFace')

const MAX_OFFSET = 400

call.hidden = true

let myStream
let muted = false
let cameraOff = false
let roomName
let myPeerConnection

socket.on('connect', () => {
    console.log('서버에 연결됨')
})

// ------ handling web rtc ----------

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

// Welcome Form (join a room)

async function initCall() {
    call.hidden = false
    await getMedia()
    makeConnection()
    roomName = window.location.pathname.split("/")[2]
    socket.emit('join_room', roomName)
}




// socket Code

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

console.log('seocker')


// message attach code

const attachMessage = (message) => {
    const messageBox = document.createElement('div')
    const randomHorizontal = Math.random() * MAX_OFFSET
    const randomVertical = Math.random() * MAX_OFFSET

    // Set relative locaiton of messageBox
    randomHorizontal > 200
        ? (messageBox.style.right = `${randomHorizontal - 200}px`)
        : (messageBox.style.left = `${randomHorizontal}px`)

    randomVertical > 200
        ? (messageBox.style.bottom = `${randomVertical - 200}px`)
        : (messageBox.style.top = `${randomHorizontal}px`)

    messageBox.className = 'messagebox'
    messageBox.innerText = message
    myScreen.appendChild(messageBox)
    setTimeout(() => {
        myScreen.removeChild(messageBox)
    }, 1000)
}

messageForm.addEventListener('submit', (e) => {
    e.preventDefault()
    if (messageInput.value.trim() === '') {
        messageInput.value = ''
        return
    }

    const message = messageInput.value
    messageInput.value = ''
    attachMessage(message)
})

connectBtn.addEventListener("click", () => {
    initCall()
})
