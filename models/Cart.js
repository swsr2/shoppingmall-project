const mongoose = require('mongoose');
const User = require('./User'); // 외래키 참조
const Product = require('./Product'); // 외래키 참조 
const Schema = mongoose.Schema;
const cartSchema = Schema({
    userId: { type: mongoose.ObjectId, ref: User },
    items: [{
        productId: { type: mongoose.ObjectId, ref: Product },
        size: { type: String, required: true },
        qty: { type: Number, default: 1, required: true }
    }]
}, { timestamps: true })
// 불필요한 정보 제거
cartSchema.methods.toJSON = function () {
    const obj = this._doc
    delete obj.updateAt
    return obj
}

const Cart = mongoose.model("Cart", cartSchema)
module.exports = Cart