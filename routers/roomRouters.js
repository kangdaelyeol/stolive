import express from 'express'
import {
    postRoomInfo,
    postRoomLeave,
    postRoomSearch,
    postCreateRoom,
} from '../controllers/roomController.js'

const roomRouter = express.Router()

roomRouter.post('/info', postRoomInfo)
roomRouter.post('/leave', postRoomLeave)
roomRouter.post('/search', postRoomSearch)
roomRouter.post('/create', postCreateRoom)

export default roomRouter
