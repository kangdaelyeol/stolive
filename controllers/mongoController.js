import User from '../mongo/model/user.js'
import bcrypt from 'bcrypt'
import { createToken } from '../jwtAuth.js'

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
        console.log('result Create User', result)
        return res.status(201).json({
            status: true,
            data: result,
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
    const bodyData = req.body.data
    const newpw = await bcrypt.hash(bodyData.pw, SALT_ROUND)
    const newUser = {
        ...bodyData,
        password: newpw,
    }
    console.log(newUser)
    delete newUser.pw
    try {
        const data = await User.findOneAndUpdate(
            { userName: bodyData.userName },
            newUser,
            { new: true },
        )
        const userData = {
            userName: data.userName,
            nickName: data.nickName,
            age: data.age,
            hb: data.hb,
            email: data.email,
            profile: data.profile,
        }
        const JToken = createToken(userData)
        console.log(userData)
        return res
            .status(200)
            .json({ status: true, data: userData, jwt: JToken })
    } catch (e) {
        console.log(e)
        return res.status(400).json({ status: false, data: '홀리싯' })
    }
}

export const postDeleteUser = async (req, res, next) => {
    const bodyData = req.body.data
}
