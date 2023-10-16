const socket = io.connect()

// temp userName
const username = `USER_${Date.now()}`

// entered Room - room.pug
const enteredRoomForm = document.querySelector('.room__entered')
const myFace = document.getElementById('myface')
const muteBtn = document.getElementById('mute')
const cameraBtn = document.getElementById('camera')
const camerasSelect = document.getElementById('cameras')
const call = document.getElementById('call')
const connectBtn = document.querySelector('#connect')

const messageForm = document.querySelector('.message__form')
const messageInput = document.querySelector('.message__input')
const myScreen = document.querySelector('.myface')
const streamBox = document.querySelector('.streambox')

const controlForm = document.querySelector('.control__form')

const MAX_OFFSET = 400

call.hidden = true

let myStream
let muted = false
let cameraOff = false
let roomName
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
    peerConnections.forEach((pc) => {
        if (pc) {
            const videoTrack = myStream.getVideoTracks()[0]
            const videoSender = pc
                .getSenders()
                .find((sender) => sender.track.kind === 'video')
            videoSender.replaceTrack(videoTrack)
        }
    })
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
    socket.emit('join_room', roomName, socket.id, username)
}

// socket Code

socket.on('welcome', async (senderId) => {
    // Welcome -> 처음 온 사람만 보냄
    // senderId -> 처음 온 사람의 Id -> 그 아이디에 대한 peerConnection 처리
    const peerConnection = getRTCPeerConnection(senderId, socket.id)
    peerConnections[`${senderId}`] = peerConnection

    const offer = await peerConnections[`${senderId}`].createOffer()
    peerConnections[`${senderId}`].setLocalDescription(offer)
    console.log('sent the offer')
    // offer -> 나의 개인 room을 보낸다
    // 상대방 Id + 내 Id
    console.log(offer)
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
    peerConnection.addEventListener('addstream', (data) => {
        handleAddStream(data, senderId)
    })
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

function handleAddStream(data, senderId) {
    const peerFaceBox = document.createElement('div')
    peerFaceBox.classList.add('peerface', `V_${senderId}`)
    const peerVideo = document.createElement('video')
    peerVideo.setAttribute('autoplay', 'true')
    peerVideo.setAttribute('playsinline', 'true')
    peerVideo.setAttribute('width', MAX_OFFSET)
    peerVideo.setAttribute('height', MAX_OFFSET)

    peerVideo.srcObject = data.stream
    peerFaceBox.appendChild(peerVideo)
    streamBox.appendChild(peerFaceBox)
}

// user leave

socket.on('willleave', (senderId) => {
    console.log(senderId, 'leave')
    handleRemoveStream(senderId)
})

socket.on("disconnecting", () => {
    socket.emit("abc", "message", socket.id)
})

const handleRemoveStream = (senderId) => {
    const removeBox = document.querySelector(`.V_${senderId}`)
    if (removeBox) {
        const leaveBox = document.createElement('div')
        leaveBox.classList.add('leave_box')
        leaveBox.innerText = 'ㅠ ㅠ'
        removeBox.appendChild(leaveBox)
        const video = removeBox.querySelector('video')
        console.log(video)
        removeBox.removeChild(video)
        setTimeout(() => {
            streamBox.removeChild(removeBox)
        }, 1000)
    }
}

// message attach code

const attachMessage = (message, peerId) => {
    console.log(message, peerId)
    const messageBox = document.createElement('div')
    const randomHorizontal = Math.random() * MAX_OFFSET
    const randomVertical = Math.random() * MAX_OFFSET

    // Set relative locaiton of messageBox
    randomHorizontal > MAX_OFFSET / 2
        ? (messageBox.style.right = `${randomHorizontal - MAX_OFFSET / 2}px`)
        : (messageBox.style.left = `${randomHorizontal}px`)

    randomVertical > MAX_OFFSET / 2
        ? (messageBox.style.bottom = `${randomVertical - MAX_OFFSET / 2}px`)
        : (messageBox.style.top = `${randomHorizontal}px`)

    messageBox.className = 'messagebox'
    messageBox.innerText = message
    if (peerId) {
        const peerBox = document.querySelector(`.V_${peerId}`)
        peerBox.appendChild(messageBox)
        setTimeout(() => {
            peerBox.removeChild(messageBox)
        }, 1000)
    } else {
        myScreen.appendChild(messageBox)
        setTimeout(() => {
            myScreen.removeChild(messageBox)
        }, 1000)
    }
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
    socket.emit('message', roomName, socket.id, message)
})

socket.on('message', (senderId, message) => {
    attachMessage(message, senderId)
})

controlForm.addEventListener('submit', (e) => {
    e.preventDefault()
})

connectBtn.addEventListener('click', () => {
    initCall()
})
