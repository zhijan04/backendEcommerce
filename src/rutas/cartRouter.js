const express = require('express');
const router = express.Router();
const CartsManager = require('../clases/cartManager');

const cartsManager = new CartsManager();

router.get('/', async (req, res) => {
    try {
        const carts = await cartsManager.getCarts();
        res.status(200).json(carts);
    } catch (error) {
        handleError(res, error);
    }
});

router.get('/:cid', async (req, res) => {
    try {
        const cartId = parseInt(req.params.cid);
        const cart = await cartsManager.getCartById(cartId);

        if (cart && cart !== "Carrito no encontrado.") {
            res.status(200).json(cart);
        } else {
            res.status(404).json({ message: "Carrito no encontrado" });
        }
    } catch (error) {
        handleError(res, error);
    }
});

router.post('/', async (req, res) => {
    try {
        const cart = await cartsManager.createCart();
        if (cart) {
            res.status(201).json({ message: `Carrito con id: ${cart.id} creado` });
        } else {
            handleError(res, "Error creando carrito");
        }
    } catch (error) {
        handleError(res, error);
    }
});

router.post('/:cid/product/:pid', async (req, res) => {
    const cartId = parseInt(req.params.cid);
    const productId = parseInt(req.params.pid);
    const result = await cartsManager.addProductToCart(cartId, productId);

    if (result.status === 200) {
        res.status(200).json({ message: result.message });
    } else if (result.status === 404) {
        res.status(404).json({ error: result.error });
    } else {
        handleError(res, result.error);
    }
});

function handleError(res, error) {
    console.error('Error:', error);
    res.status(500).json({ error: "Error de servidor" });
}

module.exports = router;