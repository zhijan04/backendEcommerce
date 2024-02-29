const express = require('express');
const router = express.Router();
const productsRouter = require('../rutas/ProductRouter.js');
const viewController = require('../controllers/viewController.js');

const auth = (req, res, next) => {
    if (!req.session.user && !req.session.usuario) {
        return res.redirect('/login');
    }

    next();
};

const auth2 = (req, res, next) => {
    if (req.session.user || req.session.usuario) {
        return res.redirect('/perfil');
    }

    next();
};

router.get('/productos',auth, viewController.getProducts);

router.get('/carts', viewController.getCarts);

router.get('/carts/:cid',auth, viewController.getOneCart);

router.get('/realtimeproducts', viewController.getRealTimeProducts)

router.get('/',auth, viewController.homePage);

router.get('/registro',auth2, viewController.register);

router.get('/login',auth2, viewController.login);

router.get('/perfil',auth, viewController.getUser);

router.use('/products', productsRouter);

router.get('/restablecer', auth2, viewController.formRestContraseña)

router.post('/restablecerToken', auth2, viewController.enviarToken)

router.get('/restablecerPassword/:Token', auth2, viewController.validarToken)

router.post('/restablecerPassword/:Token', viewController.actualizarPassword)

module.exports = router;