const User = require("../models/User")
const bcrypt = require('bcryptjs')
const authController = {}
const jwt = require('jsonwebtoken')
require('dotenv')
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY
const { OAuth2Client } = require('google-auth-library');
const GOOGLE_CLIENT_KEY = process.env.GOOGLE_CLIENT_KEY
authController.loginWithEmail = async (req, res) => {
    try {
        const { email, password } = req.body
        let user = await User.findOne({ email })
        if (user) {
            const isMatch = await bcrypt.compare(password, user.password)
            if (isMatch) {
                // token 
                const token = await user.generateToken()
                return res.status(200).json({ status: "success", user, token })
            }
        }
        throw new Error("invalid email or password")
    } catch (error) {
        res.status(400).json({ status: "fail", error: error.message })
    }
}
authController.authenticate = async (req, res, next) => {
    try {
        const tokenString = req.headers.authorization
        if (!tokenString) throw new Error("Token not found")
        const token = tokenString.replace("Bearer ", "")
        jwt.verify(token, JWT_SECRET_KEY, (error, payload) => {
            if (error) throw new Error("invalid token")
            req.userId = payload._id
        })
        next()
    } catch (error) {
        res.status(400).json({ status: "fail", error: error.message })
    }
}

authController.checkAdminPermission = async (req, res, next) => {
    try {
        // token
        const { userId } = req
        const user = await User.findById(userId)
        if (user.level !== "admin") throw new Error("no permission")
        next()
    } catch (error) {
        res.status(400).json({ status: "fail", error: error.message })
    }
}

authController.loginWithGoogle = async (req, res) => {
    try {
        // 토큰 읽어와서 유저 뽑기(email)
        const { token } = req.body
        // 토큰 해석 - 라이브러리
        const googleClient = new OAuth2Client(GOOGLE_CLIENT_KEY)
        const ticket = await googleClient.verifyIdToken({
            idToken: token,
            audience: GOOGLE_CLIENT_KEY,
        })

        const { email, name } = ticket.getPayload()
        let user = await User.findOne({ email })
        // 로그인 안했으면 저장 후 토큰 줌
        if (!user) {
            const randomPassword = "" + Math.floor(Math.random() * 100000000)
            const salt = await bcrypt.genSalt(10)
            const newPassword = await bcrypt.hash(randomPassword, salt)
            user = new User({
                name,
                email,
                password: newPassword,
            })
            await user.save()
        }
        // 이미 로그인 했으면 토큰 주고 끝
        const sessionToken = await user.generateToken()
        return res.status(200).json({ status: "success", user, token: sessionToken })
    } catch (error) {
        return res.status(400).json({ status: "fail", error: error.message })
    }
}
module.exports = authController