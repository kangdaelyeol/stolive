import express from 'express'
import {
    postCreateUser,
    postUpdateUser,
    postDeleteUser
} from '../controllers/userController.js'

const userRouter = express.Router()

userRouter.post('/create', postCreateUser)
userRouter.post('/update', postUpdateUser)
userRouter.post('/delete', postDeleteUser)

export default userRouter
