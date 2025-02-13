const express = require('express')
const router = express.Router()
const productController = require('../controllers/product.controller')
const authController = require('../controllers/auth.controller')

// 상품생성(admin만)
router.post('/', authController.authenticate, authController.checkAdminPermission, productController.createProduct)
// 상품 가져오기
router.get('/', productController.getProducts)
// 상품 수정하기(admin만)
router.put('/:id', authController.authenticate, authController.checkAdminPermission, productController.updateProduct)
// 상품 삭제하기(admin만)
router.delete('/:id', authController.authenticate, authController.checkAdminPermission, productController.deleteProduct)
// 상품 디테일 페이지
router.get('/:id', productController.getProductDetail)
module.exports = router