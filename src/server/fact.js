import crypto from 'crypto'

export const getRandomBase64String = (byteLength) => {
    const randomBytes = crypto.randomBytes(byteLength)
    return randomBytes.toString('base64')
}
