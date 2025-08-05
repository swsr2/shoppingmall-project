const orderController = {}
const Order = require('../models/Order');
const productController = require('./product.controller');
const randomStringGenerator = require('../utils/randomStringGenerator');
const { populate } = require('dotenv');
const PAGE_SIZE = 10
orderController.createOrder = async (req, res) => {
    try {
        //fe 보낸 data 받아오기 userId, totalPrice, shipTo, contact,orderList
        const { userId } = req;
        const { shipTo, totalPrice, contact, orderList } = req.body
        // 재고수량 확인 & 재고 업데이트
        const insufficientStockItems = await productController.checkItemListStock(orderList)

        // 재고가 충분하지 않은 경우 => error
        if (insufficientStockItems.length > 0) {
            const errorMessage = insufficientStockItems.reduce((total, item) => total += item.message, "")
            throw new Error(errorMessage)
        }

        //order 만들기
        const newOrder = new Order({
            userId,
            totalPrice,
            shipTo,
            contact,
            items: orderList,
            orderNum: randomStringGenerator(),
        })

        await newOrder.save()
        // 주문후 카트 비우기

        res.status(200).json({ status: 'success', orderNum: newOrder.orderNum })
    } catch (error) {
        res.status(400).json({ status: 'fail', error: error.message })
    }
}

orderController.getOrder = async (req, res) => {
    try {
        const { userId } = req
        const orderList = await Order.find({ userId }).populate({
            path: "items",
            populate: {
                path: "productId",
                model: "Product",
                select: "image name",
            }
        })
        const totalItemNum = await Order.countDocuments({ userId });
        const totalPageNum = Math.ceil(totalItemNum / PAGE_SIZE)

        res.status(200).json({ status: 'success', data: orderList, totalPageNum })
    } catch (error) {
        res.status(400).json({ status: 'fail', error: error.message })
    }
}

orderController.getOrderList = async (req, res) => {
    try {
        const { page, orderNum } = req.query
        // console.log("오더넘버:", orderNum)
        let cond = {};
        if (orderNum) {
            cond = {
                orderNum: { $regex: `^${orderNum}`, $options: 'i' }
            }
        }

        const orderList = await Order.find(cond)
            .populate("userId")
            .populate({
                path: "items",
                populate: {
                    path: "productId",
                    model: "Product",
                    select: "image name",
                },
            })
            .skip((page - 1) * PAGE_SIZE)
            .limit(PAGE_SIZE);
        const totalItemNum = await Order.find(cond).countDocuments();

        const totalPageNum = Math.ceil(totalItemNum / PAGE_SIZE);
        res.status(200).json({ status: "success", data: orderList, totalPageNum });
    } catch (error) {
        res.status(400).json({ status: 'fail', error: error.message })
    }
}

orderController.updateOrder = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const order = await Order.findByIdAndUpdate(
            id,
            { status: status },
            { new: true }
        );
        if (!order) throw new Error("Can't find order");

        res.status(200).json({ status: "success", data: order });
    } catch (error) {
        return res.status(400).json({ status: "fail", error: error.message });
    }
};
module.exports = orderController