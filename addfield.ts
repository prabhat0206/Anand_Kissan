import {Product} from "./database/productdb"

const createFieldInExistModel = async () => {
    const products = await Product.find()
    for (let product of products) {
        await Product.updateOne({$set: {technical: ""}})
    }
}

createFieldInExistModel()
