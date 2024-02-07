const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController.js');
const MiddcartMatch = (req, res, next) => {
    if (req.session.user) {
        const cartIdInURL = req.params.cid;
        const userCartId = req.session.user.cartId;

        if (cartIdInURL === userCartId) {
            next();
        } else {
            res.status(403).json({ error: "No tienes permisos para realizar esta acción." });
        }
    } else {
        res.status(401).json({ error: "Debes estar autenticado para realizar esta acción." });
    }
};
router.get('/', cartController.getCarts);

router.get('/:cid', cartController.getIndvCart);

router.get('/:cid/purchase', cartController.purchaseTicket);

router.post('/:cid/product/:_id', MiddcartMatch, cartController.addProductToCart);

router.post('/', cartController.createCart);

router.delete('/:cid/product/:pid', cartController.deleteProduct);

router.delete('/:cid', cartController.deleteAllProducts);

router.put('/:cid', cartController.updateCart);

router.put('/:cid/product/:pid', cartController.updateProductQuantity);

module.exports = router;