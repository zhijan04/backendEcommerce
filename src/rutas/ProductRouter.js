const express = require('express');
const router = express.Router();
const productController = require ("../controllers/productController.js");
const sessionController = require ("../controllers/sessionController.js")

router.get('/', productController.getProductos);

router.get('/:pid', productController.getOneProducto);

router.delete('/:pid',sessionController.middlewareCheckAdmin, productController.deleteProducto);

router.post('/',sessionController.middlewareCheckAdmin, productController.addProducto)

router.put('/:pid',sessionController.middlewareCheckAdmin, productController.updateProducto);

module.exports = router;