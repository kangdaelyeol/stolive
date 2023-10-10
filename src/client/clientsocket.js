console.log('dpdkffm')
const socket = io.connect('http://localhost:8000')

socket.on('connect', function () {
    console.log('서버에 연결됨')
})

socket.emit('yeal', () => {
    console.log('yeal event')
})

socket.on('dkdld', (payload) => {
    console.log(payload)
    console.log('dkdld')
})
