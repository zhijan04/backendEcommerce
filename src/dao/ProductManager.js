const productosModelo = require('../dao/models/productsModel.js')
const mongoose = require('mongoose')

async function addProductRawJSON(productData) {
    try {
        const product = await productosModelo.findOne({ code: productData.code })
        if (product) {
            return {
                message: "Ya existe un producto con ese código."
            }
        } else {
            const newProduct = await productosModelo.create(productData)
            return {
                message: "Producto agregado correctamente.",
                product: newProduct
            };
        }
    } catch (error) {
        console.log(error)
        return {
            message: "agregando producto"
        };
    }
}
async function getAllProducts() {
    try {
        const products = await productosModelo.find();

        if (products.length === 0) {
            return {
                message: "No hay productos disponibles.",
                products: []
            };
        } else {
            return {
                message: "Productos cargados correctamente.",
                products: products
            };
        }
    } catch (error) {
        console.log(error);
        return {
            message: "Error obteniendo los productos."
        };
    }
}


async function getProductById(pid) {
    try {
        const product = await productosModelo.findOne({ _id: pid });
        console.log(product)

        if (!product) {
            return {
                message: "No existe un producto con ese ID."
            };
        } else {
            return {
                message: "Producto encontrado correctamente.",
                product: product
            };
        }
    } catch (error) {
        console.log(error);
        return {
            message: "Error obteniendo el producto por ID."
        };
    }
}

async function updateProductById(pid, updates) {
    try {
        const product = await productosModelo.findOne({ _id: pid });

        if (!product) {
            return "Producto no encontrado.";
        }
        Object.assign(product, updates);

        await product.save();

        return "Producto actualizado correctamente.";
    } catch (error) {
        console.log(error);
        return "Error actualizando el producto.";
    }
}
async function deleteProductById(pid) {
    try {
        const product = await productosModelo.findOne({ _id: pid });

        if (!product) {
            return "Producto no encontrado.";
        }

        await productosModelo.deleteOne({ _id: pid });

        return "Producto eliminado correctamente.";
    } catch (error) {
        console.log(error);
        return "Error eliminando el producto.";
    }
}


module.exports = {
    addProductMongo: addProductRawJSON,
    getProductById,
    updateProductMongo: updateProductById,
    deleteProductMongo: deleteProductById,
    getProductsMongo: getAllProducts
}