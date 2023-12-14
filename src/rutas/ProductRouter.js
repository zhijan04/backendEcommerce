const express = require('express');
const router = express.Router();
const ProductManager = require('../clases/ProductManager.js');
const { addProductMongo, getProductById, updateProductMongo, deleteProductMongo, getProductsMongo } = require('../dao/ProductManager.js');
const productosModelo = require('../dao/models/productsModel.js');


router.get('/', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const page = parseInt(req.query.page) || 1;
        const startIndex = (page - 1) * limit;

        const products = await getProductsMongo(startIndex, limit);

        const final = products.products.map(objectMongo => {
            const object = objectMongo.toObject({ getters: true, setters: false });
            return object;
        });

        const totalPages = Math.ceil(products.totalProducts / limit);
        const prevPage = page > 1 ? page - 1 : null;
        const nextPage = page < totalPages ? page + 1 : null;

        const response = {
            status: "success",
            payload: final,
            totalPages: totalPages,
            prevPage: prevPage,
            nextPage: nextPage,
            page: page,
            hasPrevPage: prevPage !== null,
            hasNextPage: nextPage !== null,
            prevLink: prevPage !== null ? `/productos?page=${prevPage}&limit=${limit}` : null,
            nextLink: nextPage !== null ? `/productos?page=${nextPage}&limit=${limit}` : null
        };
        console.log(response);

        res.json(response);

    } catch (error) {
        console.log(error);
        handleServerError(res);
    }
});

router.get('/:pid', async (req, res) => {
    try {
        const productId = req.params.pid;
        const product = await getProductById(productId);
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
        const productId = req.params.pid;
        const result = await deleteProductMongo(productId);
        console.log(result)
        if (result === "Producto eliminado correctamente.") {
            { io.emit("realTimeProductDelete", productId) }
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
        const result = await addProductMongo(productData);
        const response = {
            "Ya existe un producto con ese código.": 400,
            "Producto agregado correctamente.": 201,
            "Error al agregar el producto": 500,
        };
        const reStatus = response[result.message] || 500;
        console.log(result.message, reStatus, result)
        if (reStatus === 201) { io.emit("realTimeProduct", result.product) }
        return res.status(reStatus).json({ message: result.message });

    } catch (error) {
        console.log(error)
        handleServerError(res);
    }
});

router.put('/:pid', async (req, res) => {
    try {
        const productId = parseInt(req.params.pid);
        const updates = req.body;
        const result = await updateProductMongo(productId, updates);
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