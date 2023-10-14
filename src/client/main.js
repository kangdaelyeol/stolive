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

roomsBtn.addEventListener('click', (e) => {
    const roomId = e.target.dataset.rid
    console.log(roomId)
    if (roomId) window.location.href = '/room/' + roomId
    else return
})
