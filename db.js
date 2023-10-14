/**
 Schema
  room: {
    <id>: {
        roomId: String
        title: String
        description: String
        host: userName
        users: [userName]
        category: String
        subCategory: [String]
        createdAt:String
    }
   }
 */

export const rooms = {
    r123: {
        roomId: "r123",
        title: 'Title',
        description: 'des',
        category: 'Study', // temp
        subCategory: ['s', 'u', 'b'], // temp
    },
}

export const getAllRooms = () => {
    return { ...rooms }
}

export const getRoomsByKeyword = (keyword) => {
    const data = {}
    const kw = keyword.trim().split(' ')
    const searched = []

    // keyword -> find
    Object.keys(rooms).forEach((v) => {
        kw.forEach((k) => {
            if (rooms[`${v}`].title.includes(k) && !searched.includes(v))
                searched.push(v)
        })
    })

    searched.forEach((k) => {
        data[`${k}`] = { ...rooms[`${k}`] }
    })

    return data
}

export const getRoomsByCategory = (category) => {
    const data = {}

    Object.keys(rooms).forEach((v) => {
        if (rooms[`${v}`].category === category) {
            data[`${v}`] = { ...rooms[`${v}`] }
        }
    })

    return data
}

export const createRoom = (title, description, userName, category, subCategory) => {
    const roomId = String(Date.now())
    const roomInfo = {
        host: userName,
        title,
        description,
        category: category || 'abc', // temp
        subCategory: subCategory || ['s', 'u', 'b'], // temp
        roomId,
        createdAt: new Date().toDateString(),
        users: [userName],
    }
    rooms[roomId] = { ...roomInfo }
    return roomInfo
}

export const updateRoom = (roomInfo) => {
    rooms[`${roomInfo.roomId}`] = { ...roomInfo }
    return { ...roomInfo }
}
