const mongoose = require('mongoose');
const User = require('./User'); // 외래키 참조
const Product = require('./Product'); // 외래키 참조 
const Cart = require('./Cart');
const Schema = mongoose.Schema;
const orderSchema = Schema({
    shipTo: { type: Object, required: true },
    contact: { type: Object, required: true },
    totalPrice: { type: Number, required: true, default: 0 },
    userId: { type: mongoose.ObjectId, ref: User, required: true },
    status: { type: String, default: "preparing" },
    orderNum: { type: String },
    items: [{
        productId: { type: mongoose.ObjectId, ref: Product, required: true },
        size: { type: String, required: true },
        qty: { type: Number, default: 1, required: true },
        price: { type: Number, required: true }
    }]
}, { timestamps: true })
// 불필요한 정보 제거
orderSchema.methods.toJSON = function () {
    const obj = this._doc
    delete obj.__v
    delete obj.updateAt
    return obj
}
// 오더 후 카트 비우기 
orderSchema.post("save", async function () {
    const cart = await Cart.findOne({ userId: this.userId })
    cart.items = []
    await cart.save()
})

const Order = mongoose.model("Order", orderSchema)
module.exports = Order