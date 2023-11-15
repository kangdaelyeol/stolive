import mongoose from 'mongoose'

const { Schema } = mongoose

const userSchema = new Schema(
    {
        userName: {
            type: String,
            required: true,
            unique: true,
        },
        nickName: {
            type: String,
            required: true,
        },
        password: {
            type: String,
            required: true,
        },
        email: { type: String, required: true, unique: true },
        hb: {
            type: Number,
            required: true,
        },
        age: {
            type: Number,
            required: true,
        },
        profile: String,
    },
    { timestamps: true },
)

export default mongoose.model.User || mongoose.model('User', userSchema)
