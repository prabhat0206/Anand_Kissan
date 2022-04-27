import {Product} from "./database/productdb"

const createFieldInExistModel = async () => {

   return await Product.updateMany({$set: {technical: ""}})
}

createFieldInExistModel()
