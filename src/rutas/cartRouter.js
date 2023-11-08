const express = require('express');
const cartRouter = express.Router();
const CartManager = require('../clases/cartManager'); 
const path = require('path');
const fs = require('fs');

cartRouter.post('/', (req, res) => {
    const newCart = CartManager.createCart();
    res.status(201).json(newCart);
});

cartRouter.get('/:cid', (req, res) => {
    const cartId = req.params.cid;
    const cart = CartManager.getCart(cartId);
    if (cart) {
        console.log('Productos en el carrito', cartId, ':', cart.products);
        res.json(cart.products);
    } else {
        console.log("carro no encontrado")
        res.status(404).json({ error: 'Carrito no encontrado.' });
    }
});

cartRouter.post('/:cid/product/:pid', (req, res) => {
    const cartId = req.params.cid;
    const productId = req.params.pid;
    const quantity = req.body.quantity;

    if (!quantity || isNaN(quantity) || quantity < 1) {
        console.log('Cantidad no válida:', quantity);
        return res.status(400).json({ error: 'La cantidad debe ser un número entero mayor o igual a 1.' });
    }

    // Carga la lista de productos desde productos.json
    const productsFilePath = path.join(__dirname, '..', 'files', 'productos.json');
    const productsData = fs.readFileSync(productsFilePath, 'utf-8');
    const products = JSON.parse(productsData);

    // Verifica si el producto con el ID proporcionado existe
    const productExists = products.find(product => product.id === parseInt(productId));
    if (!productExists) {
        console.log('Producto no encontrado:', productId);
        return res.status(404).json({ error: 'El producto no existe.' });
    }

    // Si el producto existe, agrega la lógica para agregarlo al carrito.
    const success = CartManager.addProductToCart(cartId, productId, quantity);

    if (success) {
        res.status(201).json({ message: 'Producto agregado al carrito con éxito.' });
    } else {
        res.status(404).json({ error: 'Carrito no encontrado.' });
    }
});

module.exports = cartRouter;
