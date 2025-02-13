const Product = require("../models/Product")

const PAGE_SIZE = 5
const productController = {}


productController.createProduct = async (req, res) => {
    try {
        const { sku, name, size, image, category, description, price, stock, status } = req.body
        const product = new Product({ sku, name, size, image, category, description, price, stock, status })
        await product.save()
        res.status(200).json({ status: 'success', product })
    } catch (error) {
        res.status(400).json({ status: 'fail', error: error.message })
    }
}


productController.getProducts = async (req, res) => {
    try {
        const { page, name } = req.query
        const cond = name
            ? { name: { $regex: name, $options: "i" }, isDelete: false }
            : { isDelete: false };
        let query = Product.find(cond)
        let response = { status: "success" }
        // 페이지네이션 
        if (page) {
            query.skip((page - 1) * PAGE_SIZE).limit(PAGE_SIZE)
            // 최종 몇개 페이지
            // 데이터가 몇개있는지
            const totalItemNum = await Product.find(cond).countDocuments()
            // 데이터 총개수 / PAGE_SIZE
            const totalPageNum = Math.ceil(totalItemNum / PAGE_SIZE)
            response.totalPageNum = totalPageNum

        }
        const productList = await query.exec()
        response.data = productList
        res.status(200).json(response)
    } catch (error) {
        res.status(400).json({ status: 'fail', error: error.message })
    }
}

productController.updateProduct = async (req, res) => {
    try {
        const productId = req.params.id
        const { sku, name, size, image, category, description, price, stock, status } = req.body
        const product = await Product.findByIdAndUpdate({ _id: productId }, { sku, name, size, image, category, description, price, stock, status },
            { new: true }
        )
        if (!product) throw new Error("item doesn't exist")
        res.status(200).json({ status: 'success', data: product })
    } catch (error) {
        res.status(400).json({ status: 'fail', error: error.message })
    }
}

productController.deleteProduct = async (req, res) => {
    try {
        const productId = req.params.id
        const product = await Product.findByIdAndUpdate({ _id: productId }, { isDelete: true })
        if (!product) throw new Error("No item found");
        res.status(200).json({ status: "success" });
    } catch (error) {
        res.status(400).json({ status: 'fail', error: error.message })
    }
}

productController.getProductDetail = async (req, res) => {
    try {
        const productId = req.params.id
        const product = await Product.findById(productId)
        if (!product) throw new Error("No item found")
        res.status(200).json({ status: 'success', data: product })
    } catch (error) {
        res.status(400).json({ status: 'fail', error: error.message })
    }
}

productController.checkStock = async (item) => {
    // 사려는 아이템 재고 정보들고오기
    const product = await Product.findById(item.productId)
    // 사려는 아이템 qty와 재고 비교
    if (product.stock[item.size] < item.qty) {
        // 재고가 불충분하면 오더 거부 & 메세지 반환
        return { isVerify: false, message: `${product.name}의 ${item.size}재고가 부족합니다.` }
    }
    // 충분하면 재고 업데이트 후 오더성공 
    const newStock = { ...product.stock }
    newStock[item.size] -= item.qty
    product.stock = newStock

    await product.save()
    return { isVerify: true }
}
productController.checkItemListStock = async (itemList) => {
    
    const insufficientStockItems = []
    //재고 확인
    //비동기 여러개 처리
    await Promise.all(
        itemList.map(async (item) => {
            const stockCheck = await productController.checkStock(item)
            if (!stockCheck.isVerify) {
                insufficientStockItems.push({ item, message: stockCheck.message })
            }
            return stockCheck
        })
    )
    return insufficientStockItems
}

module.exports = productController