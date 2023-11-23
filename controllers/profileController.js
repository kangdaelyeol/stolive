import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export const uploadTempProfile = (req, res) => {
    const data = req.file
    const srcPath = '/' + data.path
    return res.status(200).json({ data: srcPath, formData: data })
}

export const deleteTempProfile = async (req, res) => {
    const { fileUrl } = req.body
    const fileName = path.basename(fileUrl)
    const deletePath = path.resolve(__dirname, '..', 'uploads', fileName)
    try {
        console.log('remove :', deletePath)
        fs.existsSync(deletePath) && fs.unlinkSync(deletePath)
        return res.status(200)
    } catch (e) {
        return res.status(400).json({
            status: false,
            message: e,
        })
    }
}
