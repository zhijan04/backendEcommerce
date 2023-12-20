const express = require('express');
const router = express.Router();
const CartsManager = require('../clases/cartManager.js');
const cartsModelo = require('../dao/models/cartsModel.js');
const ProductosModelo = require('../dao/models/productsModel.js');
const Carts = require('../dao/models/cartsModel.js');
const { createCartMongo, getAllCartsMongo, addProductToCartMongo, removeProductFromCartMongo, updateCartMongo, updateProductQuantityMongo, removeAllProductsFromCartMongo, getCartMongo }  = require('../dao/CartManager.js')

router.get('/', async (req, res) => {
    try {
        const carts = await getAllCartsMongo();
        res.status(200).json(carts);
    } catch (error) {
        handleError(res, error);
    }
});

function handleError(res, error) {
    console.error('Error:', error);
    res.status(500).json({ error: "Error de servidor" });
}

router.get('/:cid', async (req, res) => {
    try {
        const cartId = req.params.cid;
        const cart = await getCartMongo(cartId);

        if (cart && cart !== "Carrito no encontrado.") {
            res.status(200).json(cart);
        } else {
            res.status(404).json({ message: "Carrito no encontrado" });
        }
    } catch (error) {
        res.status(500).json({ error: "Error de servidor" });
        console.log(error)
    }
});

router.post('/:cid/product/:_id', async (req, res) => {
    try {
        const cartId = req.params.cid;
        const productId = req.params._id;
        const quantity = req.body.quantity;

        const result = await addProductToCartMongo(cartId, productId.toString(), quantity);

        if (result.status === 200) {
            res.status(200).json({ success: true, message: "Producto agregado correctamente al carrito", cartId });
        } else {
            res.status(result.status).json({ error: result.message });
        }
    } catch (error) {
        handleError(res, error);
    }
});
router.post('/', async (req, res) => {
    try {
        const cart = await createCartMongo();
        if (cart) {
            res.status(201).json({ message: `Carrito con id: ${cart._id} creado` });
        } else {
            handleError(res, "Error creando carrito");
        }
    } catch (error) {
        handleError(res, error);
    }
});

router.post('/:cid/product/:pid', async (req, res) => {
    const cartId = req.params.cid;
    const productId = req.params.pid;
    const result = await addProductToCartMongo(cartId, productId);

    if (result.status === 200) {
        res.status(200).json({ message: result.message });
    } else if (result.status === 404) {
        res.status(404).json({ error: result.error });
    } else {
        handleError(res, result.error);
    }
});
router.delete('/:cid/product/:pid', async (req, res) => {
    try {
        const cartId = req.params.cid;
        const productId = req.params.pid;

        const result = await removeProductFromCartMongo(cartId, productId);

        if (result.status === 200) {
            res.status(200).json({ message: result.message, cart: result.cart });
        } else if (result.status === 404) {
            res.status(404).json({ error: result.error });
        } else {
            handleError(res, result.error);
        }
    } catch (error) {
        handleError(res, error);
    }
});
router.delete('/:cid', async (req, res) => {
    try {
        const cartId = req.params.cid;

        const result = await removeAllProductsFromCartMongo(cartId);

        if (result.status === 200) {
            res.status(200).json({ message: result.message, cart: result.cart });
        } else if (result.status === 404) {
            res.status(404).json({ error: result.error });
        } else {
            handleError(res, result.error);
        }
    } catch (error) {
        handleError(res, error);
    }
});

router.put('/:cid', async (req, res) => {
    try {
        const cartId = req.params.cid;
        const updatedProducts = req.body.products; // Asume que el cuerpo de la solicitud tiene un arreglo de productos

        const result = await updateCartMongo(cartId, updatedProducts);

        if (result.status === 200) {
            res.status(200).json({ message: result.message, cart: result.cart });
        } else if (result.status === 404) {
            res.status(404).json({ error: result.error });
        } else {
            handleError(res, result.error);
        }
    } catch (error) {
        handleError(res, error);
    }
});
router.put('/:cid/product/:pid', async (req, res) => {
    try {
        const cartId = req.params.cid;
        const productId = req.params.pid;
        const updatedQuantity = req.body.quantity;

        const result = await updateProductQuantityMongo(cartId, productId, updatedQuantity);

        if (result.status === 200) {
            res.status(200).json({ message: result.message, cart: result.cart });
        } else if (result.status === 404) {
            res.status(404).json({ error: result.error });
        } else {
            handleError(res, result.error);
        }
    } catch (error) {
        handleError(res, error);
    }
});
function handleError(res, error) {
    console.error('Error:', error);
    res.status(500).json({ error: "Error de servidor" });
}

module.exports = router;