// * test

const roomInput = document.querySelector('.room__num')
const roomsBtn = document.querySelector('.rooms')

const createRoomBtn = document.querySelector('.create')

// create Room - roomcreate.pug
const roomCreateForm = document.querySelector('.room_create')
const title = document.querySelector('.title')
const description = document.querySelector('.description')
const category = document.querySelector('.category')
const roomCreateBtb = document.querySelector('.roomcreate__button')

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

roomsBtn.addEventListener('click', (e) => {
    e.preventDefault()
    getAllRooms()
})

// CreateRoom!

roomCreateBtb.addEventListener('click', async () => {
    await createRoom(title.value, description.value, category.value)
})

const createRoom = async (
    title,
    description,
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
            category,
            subCategory,
        }),
    })

    roomCreateForm.classList.add('display__none')
    const data = await result.json()
    console.log(data)
    window.location.href = '/room/' + data.roomId
}

const handleRoomSearch = async (e, keyword, category, subCategory) => {
    e.preventDefault()
    const result = await fetch('/search', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            keyword,
            category,
            subCategory,
        }),
    })
    const data = await result.json()
    console.log(data)
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
