import { v2 as cloudinary } from 'cloudinary'
import dotenv from 'dotenv'
import path from 'path'
dotenv.config()

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
})

export const cloudinaryUpload = async (formData) => {
    try {
        const result = await cloudinary.uploader.upload(formData.path, {
            resource_type: 'image',
            public_id: formData.path,
        })
        return result.url
    } catch (e) {
        console.log(e)
        return false
    }
}

export const cloudinaryDestroy = async (fileName) => {
    // cloudinary set ext automaticaly except for original file name\
    // so it needs to trim ext name set by cloudinary
    const extName = path.extname(fileName)
    const publicName = 'uploads/' + path.basename(fileName, extName)
    try {
        const result = await cloudinary.uploader.destroy(publicName, {
            resource_type: 'image',
        })
        return result
    } catch (e) {
        console.log(e)
        return false
    }
}
