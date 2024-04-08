const { getProductsMongo } = require('../dao/ProductManager.js');
const { getAllCartsMongo } = require('../dao/CartManager.js')
const cartsModelo = require('../dao/models/cartsModel.js');
const ProductosModelo = require('../dao/models/productsModel.js');
const logger = require ('../controllers/logger.js')
const crypto = require ('crypto')
const bcrypt = require('bcrypt')
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
const handlebars = require('handlebars');
const Usuario = require ('../dao/models/usuariosModel.js');
const config = require('../config/config.js');


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
    static async formRestContraseña(req, res) {
        res.render('restablecerContraseña')
    }
    static async enviarToken(req, res, next) {
        const email = req.body.email;
        const usuario = await Usuario.findOne({ email });
    
        if (!usuario) {
            logger.error('error, usuario no encontrado');
            const sourceError = '<p>{{errorMessage}}</p>';
            const templateError = handlebars.compile(sourceError);
            const htmlError = templateError({ errorMessage: 'Hubo un error al enviar el correo electrónico. Inténtalo con otra dirección de correo.' });
            return res.render('login', {htmlError});
        }
    
        usuario.Token = crypto.randomBytes(20).toString('hex');
        usuario.expira = new Date(Date.now() + 60 * 60 * 1000);
        await usuario.save();
    
        const ResetUrl = `http://${req.headers.host}/restablecerPassword/${usuario.Token}`;
    
        const transporter = nodemailer.createTransport({
            host: 'smtp.office365.com',
            port: 587,
            secure: false,
            auth: {
                user: config.EMAIL,
                pass: config.PASSWORD_EMAIL
            }
        });
    
        const mailOptions = {
            from: config.EMAIL,
            to: email,
            subject: 'Restablecer Contraseña',
            html: `<p>¡Hola! Hemos visto que quieres restablecer tu contraseña... </p><p>Para restablecer tu contraseña, haz clic en el siguiente enlace:</p><a href="${ResetUrl}">${ResetUrl}</a>`
        };
    
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                logger.error('Error al enviar el correo electrónico:', error);
                return res.redirect('/restablecer');
            }
    
            logger.info('eMail con restablecer contraseña enviado.');
            const source = '<p>{{message}}</p>';
            const template = handlebars.compile(source);
            const html = template({ message: 'Se ha enviado el correo electrónico correctamente. ¡Verifica tu bandeja de entrada!' });
            return res.render('login', { html });
        });
    }
    static async validarToken(req, res){
        const Token = req.params.Token
        const usuario = await Usuario.findOne({Token})
        if (!usuario || usuario.expira < new Date()) {
            logger.error('Error, token expirado o usuario no encontrado');
            const sourceExpires = '<p>{{message}}</p>';
            const templateExpires = handlebars.compile(sourceExpires);
            const htmlExpires = templateExpires({ message: '¡El email ha expirado! intentalo nuevamente.' });
            return res.render('restablecerContraseña',{htmlExpires} );
        }
        res.render('resetPassword')
    }
    static async actualizarPassword(req, res){
        try {
            const usuario = await Usuario.findOne({ Token: req.params.Token });
    
            if(!usuario){
                logger.error('Error, usuario no encontrado');
                res.redirect('/restablecer');
            }
            const nuevaContraseña = req.body.Contraseña;
            const esNuevaContraseña = await bcrypt.compare(nuevaContraseña, usuario.password);
    
            if (esNuevaContraseña) {
                logger.error('Error, la nueva contraseña es la misma que la actual');
                
                const sourceError = '<p>{{errorMessage}}</p>';
                const templateError = handlebars.compile(sourceError);
                const htmlError = templateError({ errorMessage: 'La nueva contraseña no puede ser la misma que la actual.' });
    
                return res.render('restablecerContraseña', { htmlError });
            }

            const hashedPassword = await bcrypt.hash(req.body.Contraseña, 10);
            usuario.password = hashedPassword;
            await usuario.save();
    
            logger.info('eMail con restablecer contraseña enviado.');
    
            const source = '<p>{{message}}</p>';
            const template = handlebars.compile(source);
            const html = template({ message: 'Se ha enviado el correo electrónico correctamente. ¡Verifica tu bandeja de entrada!' });
    
            const sourceSuccess = '<p>{{message}}</p>';
            const templateSuccess = handlebars.compile(sourceSuccess);
            const htmlSuccess = templateSuccess({ message: '¡Se ha enviado modificado la contraseña con éxito!' });

            logger.info('Correcto, se ha cambiado la contraseña');
            res.render('login', {htmlSuccess});
        } catch (error) {
            logger.error('Error al actualizar la contraseña', error);
            res.redirect('/restablecer');
        }
    }
    }

module.exports = viewController;