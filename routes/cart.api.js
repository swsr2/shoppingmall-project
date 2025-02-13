const express = require("express")
const router = express.Router()
const authController = require('../controllers/auth.controller')
const cartController = require("../controllers/cart.controller")

router.post('/', authController.authenticate, cartController.addItemToCart)
router.get('/', authController.authenticate, cartController.getCartList)
router.delete('/:id', authController.authenticate, cartController.cartListDelete)
router.get('/qty', authController.authenticate, cartController.getCartQty)
router.put('/:id', authController.authenticate, cartController.updateCartItemQty)

module.exports = router