import jwt from 'jsonwebtoken'

export const createToken = (payload) => {
    const token = jwt.sign(
        {
            exp: Math.floor(Date.now() / 1000 + 3600 * 24 * 7), // 토큰 유효기간 1주일
            data: payload,
        },
        process.env.JWT_SECRET,
    )
    return token
}

export const verifyToken = (token) => {
    const result = jwt.verify(token, process.env.JWT_SECRET)
    console.log(result)
    if (!result) return false

    const decoded = jwt.decode(token)
    return decoded
}