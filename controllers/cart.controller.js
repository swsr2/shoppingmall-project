const { populate } = require("dotenv");
const Cart = require("../models/Cart");

const cartController = {}

cartController.addItemToCart = async (req, res) => {
    try {
        const { userId } = req;
        const { productId, size, qty } = req.body;
        // 유저를 가지고 cart 찾기
        let cart = await Cart.findOne({ userId: userId })
        // 유저가 만든 카트가 없다면 만들어주기
        if (!cart) {
            cart = new Cart({ userId })
            await cart.save()
        }
        // 이미 카트에 들어가 있는 아이템 인지(productId, size 둘다 체크)
        const existItem = cart.items.find((item) => item.productId.equals(productId) && item.size === size)
        // 그렇다면 에러메세지('카트에 동일 아이템이 있습니다')
        if (existItem) {
            throw new Error('카트에 동일 아이템이 있습니다.')
        }
        // cart에 item 추가 
        cart.items = [...cart.items, { productId, size, qty }]
        await cart.save()

        res.status(200).json({ status: 'success', data: cart, cartItemQty: cart.items.length })
    } catch (error) {
        return res.status(400).json({ status: 'fail', error: error.message })
    }
}


cartController.getCartList = async (req, res) => {
    try {
        const { userId } = req;
        const cart = await Cart.findOne({ userId }).populate({
            path: 'items',
            populate: {
                path: 'productId',
                model: 'Product'
            }
        })
        res.status(200).json({ status: 'success', data: cart.items })
    } catch (error) {
        res.status(400).json({ status: 'fail', error: error.message })
    }
}

cartController.cartListDelete = async (req, res) => {
    try {
        const { userId } = req
        const { id } = req.params
        const cart = await Cart.findOne({ userId })
        cart.items = cart.items.filter((item) => !item._id.equals(id))
        await cart.save()
        res.status(200).json({ status: 'success', cartItemQty: cart.items.length })
    } catch (error) {
        res.status(400).json({ status: 'fail', error: error.message })
    }
}

cartController.updateCartItemQty = async (req, res) => {
    try {
        const { userId } = req
        const { id } = req.params;
        const { qty } = req.body

        const cart = await Cart.findOne({ userId }).populate({
            path: 'items',
            populate: {
                path: 'productId',
                model: "Product",
            }
        })

        if (!cart) throw new Error("There is no cart!")

        const index = cart.items.findIndex((item) => item._id.equals(id));
        if (index === -1) throw new Error("Can not find item");
        cart.items[index].qty = qty;
        await cart.save();

        res.status(200).json({ status: 'success', data: cart.items })
    } catch (error) {
        res.status(400).json({ status: 'fail', error: error.message })
    }
}

cartController.getCartQty = async (req, res) => {
    try {
        const { userId } = req
        const cart = await Cart.findOne({ userId })

        res.status(200).json({ status: 'success', qty: cart.items.length })
    } catch (error) {
        res.status(400).json({ status: 'fail', error: error.message })
    }
}

module.exports = cartController; 