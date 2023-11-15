import mongoose from 'mongoose'

const { Schema } = mongoose

const userSchema = new Schema({
    userName: {
        type: String,
        required: true,
    },
    nickName: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    hb: {
        type: String,
        required: true,
    },
    age: {
        type: String,
        required: true,
    },
    profile: String,
    timestamps: true,
})

export default mongoose.model.User || mongoose.model('User', userSchema)
