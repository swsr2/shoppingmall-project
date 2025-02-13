const express = require("express")
const userController = require("../controllers/user.controller")
const authController = require("../controllers/auth.controller")
const router = express.Router()

// 회원가입
router.post('/', userController.createUser)
// token 보내주기 - header에 들어가기때문에 post가 아니어도 된다.
// 1. 토큰이 유효한지 check
// 2. 토큰 값 가지고 유저를 찾아 리턴
router.get('/me', authController.authenticate, userController.getUser)

module.exports = router