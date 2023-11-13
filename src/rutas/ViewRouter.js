const express = require('express');
const router = express.Router();
const ProductManager = require('../clases/ProductManager');

productManager = new ProductManager();

router.get('/', async (req, res) => {
    try {
        const products = await productManager.getProducts();
        res.render('home', { products });
    } catch (error) {
        console.error('Error al cargar productos en la página de inicio:', error);
        res.status(500).json({ error: "Error de servidor" });
    }
});
router.get('/realtimeproducts', async (req, res) => {
    try {
        const products = await productManager.getProducts();
        res.render('realTimeProducts', { products });
    } catch (error) {
        console.error('Error al cargar productos en la vista en tiempo real:', error);
        res.status(500).json({ error: "Error de servidor" });
    }
});


module.exports = router;