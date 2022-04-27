import {Product} from "./database/productdb"

const createFieldInExistModel = () => {
   return Product.updateMany({$set: {technical: ""}})
}

createFieldInExistModel()
