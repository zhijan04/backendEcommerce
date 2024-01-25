const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController.js');

router.get('/', cartController.getCarts);

router.get('/:cid', cartController.getIndvCart);

router.post('/:cid/product/:_id', cartController.addProductToCart);

router.post('/', cartController.createCart);

router.delete('/:cid/product/:pid', cartController.deleteProduct);

router.delete('/:cid', cartController.deleteAllProducts);

router.put('/:cid', cartController.updateCart);

router.put('/:cid/product/:pid', cartController.updateProductQuantity);

module.exports = router;