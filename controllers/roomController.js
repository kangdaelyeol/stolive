import {
  createRoom,
  leaveRoom,
  getRoomsByQuery,
  getRoomById,
} from '../db.js'

export const postRoomInfo = (req, res) => {
    const query = req.body
    const result = getRoomById(query.roomid)
    console.log(result)
    return res.status(200).json(result)
}
export const postRoomLeave = (req, res) => {
    const query = req.body
    const { roomId, userName } = query
    // stroage inner mem
    leaveRoom(roomId, userName)
}
export const postRoomSearch = (req, res) => {
    const query = req.body
    const { keyword, category, subCategory } = query
    const data = getRoomsByQuery(keyword, category, subCategory)
    return res.status(200).json(data)
}
export const postCreateRoom = (req, res) => {
    const query = req.body
    const { title, description, category, subCategory, userName } = query.data
    const result = createRoom(
        title,
        description,
        userName,
        category,
        subCategory,
    )
    if (result) return res.status(200).json(result)
    else return res.end()
}
