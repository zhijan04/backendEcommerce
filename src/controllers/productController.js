const { addProductMongo, getProductById, updateProductMongo, deleteProductMongo, getProductsMongo } = require('../dao/ProductManager.js');
const productosModelo = require('../dao/models/productsModel.js');
const productService = require("../services/productServices.js")
const { customizeError, errorDcitionary } = require ("../errorHandler.js")

function handleError(res, errorCode) {
    console.error('Error:', errorCode);
    const customizedError = customizeError(errorCode);
    res.status(500).json({ error: customizedError.message });
}

function validateFields(data, fields) {
    return fields.filter(field => !(field in data));
}

class productController {

    static async getProductos(req, res) {
        try {
            await productService.getProducts(req, res);
        } catch (error) {
            console.error('Error al obtener productos en el controlador:', error);
            handleError(res, 'PRODUCTS_FETCH_FAILED');
        }
    }


    static async getOneProducto(req, res) {
        try {
            await productService.getOneProduct(req, res);
        } catch (error) {
            console.error('Error al obtener un producto en el controlador:', error);
            handleError(res, 'PRODUCT_NOT_FOUND');
        }
    }
    static async deleteProducto(req, res) {
        try {
            await productService.deleteProduct(req, res);
        } catch (error) {
            console.error('Error al eliminar un producto en el controlador:', error);
            handleError(res, 'PRODUCT_DELETION_FAILED');
        }
    }
    static async addProducto(req, res) {
        try {
            await productService.addProduct(req, res);
        } catch (error) {
            console.error('Error al agregar un producto en el controlador:', error);
            handleError(res, 'PRODUCT_CREATION_FAILED');
        }
    }
    static async updateProducto(req, res) {
        try {
            await productService.updateProduct(req, res);
        } catch (error) {
            console.error('Error al actualizar un producto en el controlador:', error);
            handleError(res, 'PRODUCT_UPDATED_FAILED');
        }
    }
}


module.exports = productController