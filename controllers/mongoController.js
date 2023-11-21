import User from '../mongo/model/user.js'
import bcrypt from 'bcrypt'
import { createToken } from '../jwtAuth.js'
import { cloudinaryDestroy, cloudinaryUpload } from '../cloudinary.js'
import path from 'path'

const SALT_ROUND = 10

export const postCreateUser = async (req, res, next) => {
    const bodyData = req.body.data
    const newpw = await bcrypt.hash(bodyData.pw, SALT_ROUND)
    const newUser = {
        ...bodyData,
        password: newpw,
        profile: 'None',
    }
    delete newUser.pw
    try {
        const result = await User.create(newUser)
        const { userName, nickName, hb, email, age, profile } = result
        const userData = {
            userName,
            nickName,
            hb,
            age,
            profile,
            email,
        }

        const JToken = createToken(userData)
        return res.status(201).json({
            status: true,
            data: userData,
            jwt: JToken,
        })
    } catch (e) {
        console.log('error Create User', e)
        return res.status(400).json({
            status: false,
            data: e,
        })
    }
}

export const postUpdateUser = async (req, res, next) => {
    const { userData, formData } = req.body
    const newpw = await bcrypt.hash(userData.pw, SALT_ROUND)
    const profileUrl = await cloudinaryUpload(formData)

    const newUser = {
        ...userData,
        password: newpw,
        profile: profileUrl,
    }

    delete newUser.pw

    try {
        // delete prev file in Cloudinary
        const data = await User.findOneAndUpdate(
            { userName: userData.userName },
            newUser,
        )
        const prevProfileName = path.basename(data.profile)
        const result = await cloudinaryDestroy(prevProfileName)
        console.log('delete Cloudinary :', prevProfileName, result)
        const { userName, nickName, age, hb, email, profile } = newUser
        const user = {
            userName,
            nickName,
            age,
            hb,
            email,
            profile,
        }
        const JToken = createToken(user)
        return res.status(200).json({ status: true, data: user, jwt: JToken })
    } catch (e) {
        console.log(e)
        return res.status(400).json({ status: false, data: '홀리싯' })
    }
}

export const postDeleteUser = async (req, res, next) => {
    const data = req.body.data
}
