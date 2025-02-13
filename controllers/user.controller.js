const User = require("../models/User")
const bcrypt = require('bcryptjs')
const userController = {}

userController.createUser = async (req, res) => {
    try {
        let { email, password, name, level } = req.body
        const user = await User.findOne({ email })
        if (user) {
            throw new Error('이미 회원가입한 유저입니다')
        }
        // 암호화 
        const salt = await bcrypt.genSaltSync(10)
        password = await bcrypt.hash(password, salt)
        const newUser = new User({ email, password, name, level: level ? level : 'customer' })
        await newUser.save()
        return res.status(200).json({ status: 'success' })
    } catch (error) {
        return res.status(400).json({ status: 'fail', error: error.message })
    }
}


userController.getUser = async (req, res) => {
    try {
        const { userId } = req;
        const user = await User.findById(userId)
        if (user) {
            return res.status(200).json({ status: "success", user })
        }
        throw new Error("Invalid token")
    } catch (error) {
        return res.status(400).json({ status: "fail", error: error.message })
    }
}

module.exports = userController