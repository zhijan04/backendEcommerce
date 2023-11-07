const express = require('express');
const ProductManager = require('../clases/ProductManager');

const productRouter = express.Router();
const productManager = new ProductManager();

productRouter.get('/', async (req, res) => {
    const limit = parseInt(req.query.limit);

    if (limit) {
        const limitedProducts = await productManager.getProducts(limit);
        res.json(limitedProducts);
    } else {
        const allProducts = await productManager.getProducts();
        res.json(allProducts);
    }
});

productRouter.get('/:pid', async (req, res) => {
    const pid = parseInt(req.params.pid);
    const product = await productManager.getProductById(pid);

    if (product) {
        res.json(product);
    } else {
        res.status(404).json({ error: 'ID no válido.' });
    }
});

productRouter.post('/', async (req, res) => {
    try {
        console.log('Datos recibidos en la solicitud:', req.body)
        const { title, description, code, price, stock, category, thumbnails } = req.body;

        if (!title || !description || !code || !price || !stock || !category) {
            return res.status(400).json({ error: 'Todos los campos son obligatorios, excepto thumbnails.' });
        }

        const products = await productManager.getProducts(); 
        const lastProduct = products[products.length - 1];
        const newId = lastProduct ? lastProduct.id + 1 : 1;
        console.log('Nuevo ID generado:', newId);

        const newProduct = {
            id: newId,
            title,
            description,
            code,
            price,
            status: true,
            stock,
            category,
            thumbnails: thumbnails || [], 
        };
        console.log('Nuevo producto creado:', newProduct);

        await productManager.addProduct(
            newProduct.code,
            newProduct.title,
            newProduct.description,
            newProduct.price,
            newProduct.thumbnails,
            newProduct.stock
        );

        res.status(201).json(newProduct);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error en el servidor al agregar el producto.' });
    }
})
productRouter.put('/:pid', async (req, res) => {
    const productId = parseInt(req.params.pid);
    const { title, description, code, price, stock, category, thumbnails } = req.body;

    if (!title && !description && !code && !price && !stock && !category && !thumbnails) {
        return res.status(400).json({ error: 'Debes proporcionar al menos un campo para actualizar.' });
    }

    const products = await productManager.getProducts();

    const productIndex = products.findIndex((product) => product.id === productId);

    if (productIndex === -1) {
        return res.status(404).json({ error: 'Producto no encontrado.' });
    }

    if (title) products[productIndex].title = title;
    if (description) products[productIndex].description = description;
    if (code) products[productIndex].code = code;
    if (price) products[productIndex].price = price;
    if (stock) products[productIndex].stock = stock;
    if (category) products[productIndex].category = category;
    if (thumbnails) products[productIndex].thumbnails = thumbnails;

    await productManager.saveFile(products);

    res.json(products[productIndex]);
})
productRouter.delete('/:pid', async (req, res) => {
    const productId = parseInt(req.params.pid);

    const products = await productManager.getProducts();

    const productIndex = products.findIndex((product) => product.id === productId);

    if (productIndex === -1) {
        return res.status(404).json({ error: 'Producto no encontrado.' });
    }

    products.splice(productIndex, 1);

    await productManager.saveFile(products);

    res.status(204).send();
});

module.exports = productRouter;
