const express = require("express")
const authController = require("../controllers/auth.controller")
const router = express.Router()

// 로그인 -> 프론트엔드에서 보내고싶은 데이터면 post로(body 넣어서보낼수 있음)
router.post('/login', authController.loginWithEmail)
// 구글 로그인 -
router.post("/google", authController.loginWithGoogle)
module.exports = router