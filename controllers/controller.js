import User from '../mongo/model/user.js'
import bcrypt from 'bcrypt'
import { createToken, verifyToken } from '../jwtAuth.js'
import path from 'path'
import { fileURLToPath } from 'url'
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const RootPath = path.resolve(__dirname, '..')

export const postUserLogin = async (req, res) => {
    const { userName, password } = req.body.data
    try {
        const data = await User.findOne({ userName })
        const compare = await bcrypt.compare(password, data.password)
        if (!compare) return res.status(401).json({ status: false })
        const userData = {
            userName: data.userName,
            nickName: data.nickName,
            age: data.age,
            hb: data.hb,
            email: data.email,
            profile: data.profile,
        }
        const JToken = createToken(userData)
        return res
            .status(200)
            .json({ status: true, data: userData, jwt: JToken })
    } catch (e) {
        return res.status(401).json({ status: false })
    }
}

export const postCheckJwt = (req, res, next) => {
    const header = req.headers
    const token = header.authorization.replace('Bearer ', '')
    try {
        const decodedToken = verifyToken(token)
        console.log(decodedToken)
        return res.status(200).json({ status: true, data: decodedToken.data })
    } catch (e) {
        return res.status(401).json({ status: false, error: e })
    }
}

