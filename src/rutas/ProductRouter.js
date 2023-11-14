const express = require('express');
const router = express.Router();
const ProductManager = require('../clases/ProductManager');

const productManager = new ProductManager();

router.get('/', async (req, res) => {
    try {
        const products = await productManager.getProducts();
        console.log('Productos cargados:', products);
        res.render('home', { products });
    } catch (error) {
        handleServerError(res);
    }
});

router.get('/:pid', async (req, res) => {
    try {
        const productId = parseInt(req.params.pid);
        const product = await productManager.getProductById(productId);
        if (product) {
            res.status(200).json(product);
        } else {
            res.status(404).json({ message: "Producto no encontrado" });
        }
    } catch (error) {
        handleServerError(res);
    }
});

router.delete('/:pid', async (req, res) => {
    try {
        const io = req.app.get('socket');
        const productId = parseInt(req.params.pid);
        const result = await productManager.deleteProduct(productId);
        
        if (result === "Producto eliminado con exito") {
            {io.emit("realTimeProductDelete", productId)}
            res.status(200).json({ message: result });
        } else if (!result) {
            res.status(404).json({ message: "Producto no encontrado" });
        } else {
            handleServerError(res);
        }

    } catch (error) {
        handleServerError(res);
    }
});

router.post('/', async (req, res) => {
    try {
        const io = req.app.get('socket');
        const { title, description, price, code, stock, category, status } = req.body;
        const thumbnails = req.body.thumbnails || [];
        
        const requiredFields = ['title', 'description', 'price', 'code', 'stock', 'category'];
        const invalidFields = validateFields(req.body, requiredFields);
        if (invalidFields.length > 0) {
            return res.status(400).json({ error: `Campos inválidos: ${invalidFields.join(', ')}` });
        }

        if (!Array.isArray(thumbnails)) {
            return res.status(400).json({ error: '"Thumbnails" únicamente permite formato de arreglo. ' });
        }

        const productData = {
            title,
            description,
            price,
            thumbnails,
            code,
            stock,
            category,
            status: status !== undefined ? status : true
        };

        
        const result = await productManager.addProductRawJSON(productData);

        const response = {
            "Ya existe un producto con ese código.": 400,
            "Producto agregado correctamente.": 201,
            "Error al agregar el producto": 500,
        };
        const reStatus = response[result] || 500;

        if(reStatus === 201)
        {io.emit("realTimeProduct", productData)}
        return res.status(reStatus).json({ message: result });

    } catch (error) {
        handleServerError(res);
    }
});

router.put('/:pid', async (req, res) => {
    try {
        const productId = parseInt(req.params.pid);
        const updates = req.body;
        const result = await productManager.updateProduct(productId, updates);
        if (result) {
            res.status(200).json({ message: "Producto actualizado con exito" });
        } else {
            res.status(404).json({ message: "Producto no encontrado" });
        }
    } catch (error) {
        handleServerError(res);
    }
});

function handleServerError(res) {
    res.status(500).json({ error: "Error de servidor" });
}

function validateFields(data, fields) {
    return fields.filter(field => !(field in data));
}

module.exports = router;