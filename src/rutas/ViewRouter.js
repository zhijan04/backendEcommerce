const express = require('express');
const router = express.Router();
const ProductManager = require('../dao/ProductManager.js');
const productsRouter = require('../rutas/ProductRouter.js');
const { getProductsMongo } = require('../dao/ProductManager.js');
const cartsModelo = require('../dao/models/cartsModel.js');
const ProductosModelo = require('../dao/models/productsModel.js');

function handleServerError(res) {
    res.status(500).json({ error: "Error de servidor" });
}
const auth=(req,res, next)=>{
    if(!req.session.usuario){
        return res.redirect('/login')
    }

    next()
}
const auth2=(req,res, next)=>{
    if(req.session.usuario){
        return res.redirect('/perfil')
    }

    next()
}

router.get('/productos',auth, async (req, res) => {
    try {
        const limit = 4;
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
            prevLink: prevPage !== null ? `/productos?page=${prevPage}` : null,
            nextLink: nextPage !== null ? `/productos?page=${nextPage}` : null
        };
        console.log(response);

        res.render('products',{ products: final, pagination: response });

    } catch (error) {
        console.log(error);
        handleServerError(res);
    }
});
router.get('/carts', async (req, res) => {
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

router.get('/carts/:cid',auth, async (req, res) => {
    try {
        const cartId = req.params.cid;
        const cart = await cartsModelo.findOne({ _id: cartId }).lean();

        if (!cart) {
            return res.status(404).json({ message: "Carrito no encontrado" });
        }
        const productsWithDetails = await Promise.all(cart.products.map(async (productInfo) => {
            const product = await ProductosModelo.findById(productInfo.id).lean();
            return {
                product,
                quantity: productInfo.quantity
            };
        }));
        cart.products = productsWithDetails;
        res.render('cartView', { products: cart.products });

    } catch (error) {
        handleError(res, error);
    }
});

router.get('/realtimeproducts', async (req, res) => {
    try {
        const allProducts = await ProductosModelo.find().lean();
        if (!allProducts || allProducts.length === 0) {
            return res.status(404).json({ message: "No se encontraron productos" });
        }
        res.render('realTimeProducts', { products: allProducts});
    } catch (error) {
        console.error('Error al cargar productos en la vista en tiempo real:', error);
        res.status(500).json({ error: "Error de servidor" });
    }
});

router.get('/', (req, res) => {
    res.setHeader('Content-Type', 'text/html');
    res.status(200).render('home')
});
router.get('/registro',auth2, (req, res) => {

    let {error} = req.query
    
    res.setHeader('Content-Type', 'text/html');
    res.status(200).render('registro', {error})
});
router.get('/login',auth2, (req, res) => {

    let {error, mensaje} = req.query

    res.setHeader('Content-Type', 'text/html');
    res.status(200).render('login', {error, mensaje})
});
router.get('/perfil',auth, (req, res) => {

    let usuario=req.session.usuario
console.log(usuario)
    res.setHeader('Content-Type', 'text/html');
    res.status(200).render('perfil', {usuario})
});

router.use('/products', productsRouter);

module.exports = router;