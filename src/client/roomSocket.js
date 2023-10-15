const socket = io.connect('http://localhost:8000')

// entered Room - room.pug
const enteredRoomForm = document.querySelector('.room__entered')
const myFace = document.getElementById('myFace')
const muteBtn = document.getElementById('mute')
const cameraBtn = document.getElementById('camera')
const camerasSelect = document.getElementById('cameras')
const call = document.getElementById('call')
const connectBtn = document.querySelector('#connect')

const messageForm = document.querySelector('.message__form')
const messageInput = document.querySelector('.message__input')
const myScreen = document.querySelector('.myFace')
const streamBox = document.querySelector('.streambox')

const MAX_OFFSET = 400

call.hidden = true

let myStream
let muted = false
let cameraOff = false
let roomName
let myPeerConnection
let peerConnections = {}

// when someone emit events connecting already -> check this list and filter the offer
const connectedList = []

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
    // getMedia -> set mystream
    await getMedia()
    roomName = window.location.pathname.split('/')[2]
    socket.emit('join_room', roomName)
}

// socket Code

socket.on('welcome', async (senderId) => {
    // Welcome -> 처음 온 사람만 보냄
    // senderId -> 처음 온 사람의 Id -> 그 아이디에 대한 peerConnection 처리
    const peerConnection = getRTCPeerConnection(senderId, socket.id)
    peerConnections[`${senderId}`] = peerConnection

    console.log('connectedList:', connectedList)
    const offer = await peerConnections[`${senderId}`].createOffer()
    peerConnections[`${senderId}`].setLocalDescription(offer)
    console.log('sent the offer')
    // offer -> 나의 개인 room을 보낸다
    // 상대방 Id + 내 Id
    socket.emit(
        'offer',
        offer,
        `${roomName}${senderId}`,
        `${roomName}${socket.id}`,
    )
})

socket.on('offer', async (offer, senderName) => {
    // 받은 id == 상대방의 id

    // 나는 처음와서 roomJoin 보내고 offer 받음

    const peerConnection = getRTCPeerConnection()
    peerConnections[`${senderName}`] = peerConnection
    console.log('received the offer')
    console.log('connectedList:', connectedList)
    peerConnections[`${senderName}`].setRemoteDescription(offer)
    const answer = await peerConnections[`${senderName}`].createAnswer()
    peerConnections[`${senderName}`].setLocalDescription(answer)
    socket.emit(
        'answer',
        answer,
        `${roomName}${senderName}`,
        `${roomName}${socket.id}`,
    )
    console.log('sent the answer')
})

socket.on('answer', (answer, senderName) => {
    console.log('received the answer', answer)
    peerConnections[`${senderName}`].setRemoteDescription(answer)
})

socket.on('ice', (ice, senderName) => {
    console.log('received candidate', ice)
    peerConnections[`${senderName}`].addIceCandidate(ice)
})

// create RTC Code --welcome--

const getRTCPeerConnection = (senderId, myId) => {
    const peerConnection = new RTCPeerConnection({
        iceServers: [
            {
                urls: [
                    'stun:stun.l.google.com:19302',
                    'stun:stun1.l.google.com:19302',
                    'stun:stun2.l.google.com:19302',
                    'stun:stun3.l.google.com:19302',
                    'stun:stun4.l.google.com:19302',
                ],
            },
        ],
    })
    peerConnection.addEventListener('icecandidate', (data) => {
        handleIce(data, senderId, myId)
    })
    peerConnection.addEventListener('addstream', handleAddStream)
    myStream
        .getTracks()
        .forEach((track) => peerConnection.addTrack(track, myStream))
    return peerConnection
}

function handleIce(data, senderId, myId) {
    console.log('sent candidate')
    socket.emit(
        'ice',
        data.candidate,
        `${roomName}${senderId}`,
        `${roomName}${myId}`,
    )
}

function handleAddStream(data) {
    const peerFaceBox = document.createElement('div')
    peerFaceBox.classList.add('peerface')
    const peerVideo = document.createElement('video')
    peerVideo.setAttribute('autoplay', 'true')
    peerVideo.setAttribute('playsinline', 'true')
    peerVideo.setAttribute('width', '400')
    peerVideo.setAttribute('height', '400')

    peerVideo.srcObject = data.stream
    peerFaceBox.appendChild(peerVideo)
    streamBox.appendChild(peerFaceBox)
}

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

connectBtn.addEventListener('click', () => {
    initCall()
})
