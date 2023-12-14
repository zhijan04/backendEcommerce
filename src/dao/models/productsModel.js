const mongoose = require('mongoose')


const productsCollection = "products"
const productsSchema = new mongoose.Schema(
    {
        code:{ type: String, unique: true},
        title: String,
        description: String,
        price: Number,
        thumbnails: Array, 
        stock: Number,
        category: String,
        status: {
            type: Boolean,
            default: true,
        }
    }
)

const productosModelo = mongoose.model (productsCollection, productsSchema)

module.exports =  productosModelo