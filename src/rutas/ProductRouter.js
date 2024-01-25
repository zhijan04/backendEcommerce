const express = require('express');
const router = express.Router();
const productController = require ("../controllers/productController.js")

router.get('/', productController.getProducts);

router.get('/:pid', productController.getOneProduct);

router.delete('/:pid', productController.deleteProduct);

router.post('/', productController.addProduct)

router.put('/:pid', productController.updateProduct);

module.exports = router;