/**
 Schema
  room: {
    <id>: {
        roomId: String
        title: String
        description: String
        hostsession: <sid>
        hostname: <userName>
        users: [<sid>]
        category: String
        subCategory: [String]
        createdAt:String
    }
   }
 */

export const rooms = {}

export const getAllRooms = () => {
    const data = []
    Object.keys(rooms).forEach((k) => {
        data.push(rooms[`${k}`])
    })
    return data
}

export const getRoomById = (roomId) => {
    console.log('roomName', roomId)
    if (rooms[roomId]) {
        return rooms[roomId]
    } else return false
}

export const getRoomsByQuery = (keyword, category, subCategory) => {
    const data = []
    const searched = new Set()
    // keyword -> find
    Object.keys(rooms).forEach((v) => {
        if (keyword) {
            const kw = keyword.trim().split(' ')
            kw.forEach((k) => {
                if (rooms[`${v}`].title.includes(k)) searched.add(v)
            })
        }
        if (category) {
            if (rooms[`${v}`].category === category) searched.add(v)
        }
        if (subCategory) {
            subCategory.forEach((sc) => {
                if (rooms[`${v}`].subCategory.includes(sc)) searched.add(v)
            })
        }
        if (!keyword && !category && !subCategory) {
            searched.add(v)
        }
    })

    searched.forEach((k) => {
        data.push(rooms[`${k}`])
    })

    return data
}

export const createRoom = (
    title,
    description,
    userName,
    category,
    subCategory,
) => {
    console.log(subCategory)
    const roomId = `R_${String(Date.now())}`
    const roomInfo = {
        hostsession: '',
        hostname: userName,
        title: title || 'No Title',
        description: description || 'No Description',
        category: category || 'abc', // temp
        subCategory: subCategory
            .trim()
            .split('#')
            .map((v) => v.trim()) || ['s', 'u', 'b'], // temp
        roomId,
        createdAt: new Date().toDateString(),
        users: [],
    }
    rooms[`${roomId}`] = { ...roomInfo }
    return roomInfo
}

export const joinRoom = (roomId, userSid, userName) => {
    // handleException - 없는 방 입장 할때 - false
    if (!rooms[`${roomId}`]) return false
    rooms[`${roomId}`].users.push(userSid)
    if (rooms[`${roomId}`].hostname === '') {
        rooms[`${roomId}`].hostsession = userSid
        rooms[`${roomId}`].hostname = userName
    }
    return rooms[`${roomId}`]
}

export const updateRoom = (roomInfo) => {
    const prev = rooms[`${roomInfo.roomId}`]
    rooms[`${roomInfo.roomId}`] = { ...prev, ...roomInfo }
    return { ...roomInfo }
}

export const leaveRoom = (roomId, userSid, userName) => {
    // roomId -> roomName
    // userName -> userName not sessionId
    if (!rooms[`${roomId}`]) return false
    console.log('leaveRoom', rooms, userSid, userName)

    // 나 혼자 있는 경우
    if (rooms[`${roomId}`].users.length === 1) {
        delete rooms[`${roomId}`]
        console.log('나 혼자 방에 있음, 나가짐', rooms)
        return true
    } else if (
        rooms[`${roomId}`].users.length !== 1 &&
        rooms[`${roomId}`].hostsession === userSid
    ) {
        // 호스트가 나간 경우
        // 두 번째 유저가 호스트
        rooms[`${roomId}`].hostsession === rooms[`${roomId}`][1]
    } else {
        console.log('before', rooms)
        rooms[`${roomId}`].users.pop(userSid)
        console.log('after', rooms)
    }
    console.log('rooms after leaveRoom:', rooms)
    return true
}
