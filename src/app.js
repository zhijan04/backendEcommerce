const express = require('express');
const ProductManager = require('./ProductManager');
const PORT = 3000;
const app = express();
const productManager = new ProductManager();

//SE PONE A FUNCIONAR EL SERVIDOR //

app.get('/', (req, res) => {
    res.send("<h1>¡Bienvenidos! Para ingresar a los productos, por favor diríjase a localhost:3000/products. ¡Muchas gracias!</h1>");
});

app.get('/products', async (req, res) => {
    const limit = parseInt(req.query.limit);

    if (limit) {
        const limitedProducts = await productManager.getProducts(limit);
        res.json(limitedProducts);
    } else {
        const allProducts = await productManager.getProducts();
        res.json(allProducts);
    }
});

app.get('/products/:pid', async (req, res) => {
    const pid = parseInt(req.params.pid);
    const product = await productManager.getProductById(pid);

    if (product) {
        res.json(product);
    } else {
        res.status(404).json({ error: 'Producto no encontrado' });
    }
});



const server = app.listen(PORT, () => {
    console.log('server online')
});