const Product = require("../models/Product")

const PAGE_SIZE = 5
const productController = {}


productController.createProduct = async (req, res) => {
    try {
        const { sku, name, size, image, category, description, price, stock, status, mainCategory } = req.body
        const product = new Product({ sku, name, size, image, category, description, price, stock, status, mainCategory })
        await product.save()
        res.status(200).json({ status: 'success', product })
    } catch (error) {
        res.status(400).json({ status: 'fail', error: error.message })
    }
}

productController.getProducts = async (req, res) => {
       try {
         const { page, name, mainCategory, status } = req.query;
         const query = { isDeleted: false }; // 기본적으로 삭제되지 않은 상품만 가져옴
     
         // 이름 검색 필터링
        if (name) {
          query.name = { $regex: name, $options: "i" }; // 대소문자 구분 없이 이름 검색
        }
    
        // 메인 카테고리 필터링
        if (mainCategory) {
          query.mainCategory = { $regex: mainCategory, $options: "i" };
        }
   
        // 상태(status) 필터링 (예: sale)
        if (status) {
          query.status = status;
        }
   
        const PAGE_SIZE = 8; // 페이지당 아이템 수 (기존 코드에서 가져옴)
        const totalItemNum = await Product.countDocuments(query);
        const totalPageNum = Math.ceil(totalItemNum / PAGE_SIZE);
           const productList = await Product.find(query)
          .skip((page - 1) * PAGE_SIZE)
          .limit(PAGE_SIZE);
   
        res.status(200).json({
          status: "success",
          data: productList,
          totalPageNum,
          totalItemNum,
        });
      } catch (error) {
        res.status(400).json({ status: "fail", error: error.message });
      }
    };


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