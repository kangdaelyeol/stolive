// entered Room - room.pug
const enteredRoomForm = document.querySelector('.room__entered')
const myFace = document.getElementById('myFace')
const muteBtn = document.getElementById('mute')
const cameraBtn = document.getElementById('camera')
const camerasSelect = document.getElementById('cameras')
const call = document.getElementById('call')

const messageForm = document.querySelector('.message__form')
const messageInput = document.querySelector('.message__input')
const myScreen = document.querySelector('.myscreen')


// ------ handling web rtc ----------
call.hidden = true

let myStream
let muted = false
let cameraOff = false
let roomName
let myPeerConnection

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
