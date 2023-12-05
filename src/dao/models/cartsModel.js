const { isValidObjectId } = require('mongoose')
const mongoose = require('mongoose')


const cartsCollection = "carts"
const cartsSchema = new mongoose.Schema(
    {
        products: Array
        }
)

const cartsModelo = mongoose.model (cartsCollection, cartsSchema)

module.exports =  cartsModelo