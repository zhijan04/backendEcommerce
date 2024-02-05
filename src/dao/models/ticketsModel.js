const mongoose = require('mongoose')

const productsCollection = "tickets"
const productsSchema = new mongoose.Schema(
    {
        code:{ type: String, unique: true},
        purchase_datetime: String,
        amount: Number, 
        purchaser: String,
    }
)

const productosModelo = mongoose.model (productsCollection, productsSchema)

module.exports =  productosModelo