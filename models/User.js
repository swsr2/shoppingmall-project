const mongoose = require('mongoose')
const Schema = mongoose.Schema;
const jwt = require('jsonwebtoken')
require('dotenv').config()
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY
const userSchema = Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    level: { type: String, default: "customer" },
}, { timestamps: true })

// 불필요한 정보 제거
userSchema.methods.toJSON = function () {
    const obj = this._doc
    delete obj.password
    delete obj.__v
    delete obj.updateAt
    delete obj.createAt
    return obj
}

// token
userSchema.methods.generateToken = async function () {
    const token = await jwt.sign({ _id: this.id }, JWT_SECRET_KEY, { expiresIn: "1d" })
    return token;
}

const User = mongoose.model("User", userSchema)
module.exports = User