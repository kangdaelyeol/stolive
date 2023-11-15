import User from './mongo/model/user.js'
import bcrypt from 'bcrypt'

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
            type: 'success',
            data: result,
        })
    } catch (e) {
        console.log('error Create User', e)
        return res.status(400).json({
            type: 'error',
            data: e,
        })
    }
}

export const postUpdateUser = async (req, res, next) => {
    const bodyData = req.body.data
}

export const postDeleteUser = async (req, res, next) => {
    const bodyData = req.body.data
}
