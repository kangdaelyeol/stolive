import express from 'express'
import {
    uploadTempProfile,
    deleteTempProfile,
} from '../controllers/profileController.js'
import upload from "../upload.js"

const profileRouter = express.Router()

profileRouter.post('/upload', upload.single('avatar'), uploadTempProfile)
profileRouter.post('/delete', deleteTempProfile)

export default profileRouter
