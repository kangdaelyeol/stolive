import { v2 as cloudinary } from 'cloudinary'
import dotenv from 'dotenv'
dotenv.config()

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
})

export const cloudinaryUpload = async (data) => {
    try {
        const result = await cloudinary.uploader.upload(data.path, {
            resource_type: 'image',
            public_id: data.path,
        })
        console.log(result)
        return result
    } catch (e) {
        console.log(e)
        return false
    }
}

export const cloudinaryDestroy = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {resource_type: "image"})
    return result;
  } catch(e) {
    console.log(e)
    return false;
  }
}