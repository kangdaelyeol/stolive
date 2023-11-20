import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const Dest = path.join(__dirname, 'uploads')

const upload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            !fs.existsSync(Dest) && fs.mkdirSync(Dest)
            cb(null, 'uploads/')
        },
        filename: (req, file, cb) => {
            cb(null, new Date().valueOf() + path.extname(file.originalname))
        },
    }),
})

export default upload
