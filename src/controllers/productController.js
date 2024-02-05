const { addProductMongo, getProductById, updateProductMongo, deleteProductMongo, getProductsMongo } = require('../dao/ProductManager.js');
const productosModelo = require('../dao/models/productsModel.js');
const productService = require("../services/productServices.js")


function handleServerError(res) {
    res.status(500).json({ error: "Error de servidor" });
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
            res.status(500).json({ error: 'Error al obtener productos' });
        }
    }


    static async getOneProducto(req, res) {
        try {
            await productService.getOneProduct(req, res);
        } catch (error) {
            console.error('Error al obtener un producto en el controlador:', error);
            res.status(500).json({ error: 'Error al obtener un producto' });
        }
    }
    static async deleteProducto(req, res) {
        try {
            await productService.deleteProduct(req, res);
        } catch (error) {
            console.error('Error al eliminar un producto en el controlador:', error);
            res.status(500).json({ error: 'Error al eliminar un producto' });
        }
    }
    static async addProducto(req, res) {
        try {
            await productService.addProduct(req, res);
        } catch (error) {
            console.error('Error al agregar un producto en el controlador:', error);
            res.status(500).json({ error: 'Error al agregar un producto' });
        }
    }
    static async updateProducto(req, res) {
        try {
            await productService.updateProduct(req, res);
        } catch (error) {
            console.error('Error al actualizar un producto en el controlador:', error);
            res.status(500).json({ error: 'Error al actualizar un producto' });
        }
    }
}


module.exports = productController