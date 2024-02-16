const productsRouter = require('../rutas/ProductRouter.js');
const { getProductsMongo } = require('../dao/ProductManager.js');
const { getAllCartsMongo } = require('../dao/CartManager.js')
const cartsModelo = require('../dao/models/cartsModel.js');
const ProductosModelo = require('../dao/models/productsModel.js');

function handleError(res, error) {
    logger.error('Error:', error);
    res.status(500).json({ error: "Error de servidor" });
}

function handleServerError(res) {
    res.status(500).json({ error: "Error de servidor" });
}
class viewController {
    constructor() { }

    static async getProducts(req, res) {
        try {
            const limit = 4;
            const page = parseInt(req.query.page) || 1;
            const startIndex = (page - 1) * limit;
            let user = req.session.user
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

            res.render('products', { products: final, pagination: response, user:user});

        } catch (error) {
            logger.log(error);
            handleServerError(res);
        }
    }
    static async getCarts(req, res) {
        try {
            const carts = await getAllCartsMongo();
            res.status(200).json(carts);
        } catch (error) {
            handleError(res, error);
        }
    }
    
    static async getOneCart(req, res) {
        try {
            const cartId = req.params.cid;
            const cart = await cartsModelo.findById(cartId).lean();
            let user = req.session.user

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
            
            res.render('cartView', { products: cart.products, user});

        } catch (error) {
            handleError(res, error);
        }
    }
    static async getRealTimeProducts(req, res) {
        try {
            const allProducts = await ProductosModelo.find().lean();
            if (!allProducts || allProducts.length === 0) {
                return res.status(404).json({ message: "No se encontraron productos" });
            }
            res.render('realTimeProducts', { products: allProducts });
        } catch (error) {
            logger.error('Error al cargar productos en la vista en tiempo real:', error);
            res.status(500).json({ error: "Error de servidor" });
        }
    }
    static async homePage(req, res) {
        try {
            let usuario = req.session.user
            const allProducts = await ProductosModelo.find().lean();
            if (!allProducts || allProducts.length === 0) {
                return res.status(404).json({ message: "No se encontraron productos" });
            }
            res.render('home', { products: allProducts, usuario });
        } catch (error) {
            logger.error('Error al cargar productos en la vista en tiempo real:', error);
            res.status(500).json({ error: "Error de servidor" });
        }
    }
    static async register(req, res) {
        let { error } = req.query
        res.setHeader('Content-Type', 'text/html');
        res.status(200).render('registro', { error })
    }
    static async login(req, res) {
        let { error, mensaje } = req.query
        res.setHeader('Content-Type', 'text/html');
        res.status(200).render('login', { error, mensaje })
    }
    static async getUser(req, res) {
        let usuario = req.session.user
        res.setHeader('Content-Type', 'text/html');
        res.status(200).render('perfil', { usuario })
    }
}
module.exports = viewController;