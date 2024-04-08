const { createCartMongo, getAllCartsMongo, addProductToCartMongo, removeProductFromCartMongo, updateCartMongo, updateProductQuantityMongo, removeAllProductsFromCartMongo, getCartMongo, getProductById } = require('../dao/CartManager.js')
const { customizeError } = require ('../errorHandler.js')
const nodemailer = require('nodemailer');
const config = require ("../config/config.js")


function handleError(res, errorCode, additionalMessage) {
    console.error('Error:', errorCode);
    const customizedError = customizeError(errorCode);
    if (additionalMessage) {
        customizedError.message += `: ${additionalMessage}`;
    }
    res.status(500).json({ error: customizedError.message });
}


const TicketsModel = require("../dao/models/ticketsModel.js")
const ProductosModelo = require("../dao/models/productsModel.js")
const CartsModelo = require("../dao/models/cartsModel.js");

class cartController {
    constructor() { }

    static async getCarts(req, res) {
        try {
            const carts = await getAllCartsMongo();
            res.status(200).json(carts);
        } catch (error) {
            handleError(res, 'CARTS_FETCH_FAILED', error.message);
        }
    }

    static async getIndvCart(req, res) {
        try {
            
            const cartId = req.params.cid;
            const cart = await CartsModelo.findOne({ _id: cartId }).lean();
            let user = req.session.user
            if (!cart) {
                return res.status(404).json({ message: "Carrito no encontrado" });
            }
            const productsWithDetails = await Promise.all(cart.products.map(async (productInfo) => {
                const product = await ProductosModelo.findById(productInfo.id);
                return {
                    product,
                    quantity: productInfo.quantity
                };
            }));
            cart.products = productsWithDetails;
            res.json({ products: cart.products, user, cartId });
        } catch (error) {
            handleError(res, 'CART_NOT_FOUND', error.message);
        }
    }
    static async addProductToCart(req, res) {
        try {
            const cartId = req.params.cid;
            const productId = req.params._id;
            const quantity = req.body.quantity;
            let user = req.session.user

            if (user && user.rol === 'premium') {
                const product = await getProductById(productId);
    
                if (product && product.owner === user.email) {
                    return res.status(403).json({ message: 'Acceso no autorizado. No puedes agregar tu propio producto al carrito.' });
                }
            }
            const result = await addProductToCartMongo(cartId, productId.toString(), quantity,);

            if (result.status === 200) {
                res.status(200).json({ success: true, message: "Producto agregado correctamente al carrito", cartId, user: user });
            } else {
                res.status(result.status).json({ error: result.message });
            }
        } catch (error) {
            console.log("no se ha podido agregar un producto al carrito", error);
        }
    }
    static async createCart(req, res) {
        try {
            const cart = await createCartMongo();
            if (cart) {
                res.status(201).json({ message: `Carrito con id: ${cart._id} creado` });
            } else {
                handleError(res, 'CART_CREATION_FAILED', "Error creando carrito");
            }
        } catch (error) {
            handleError(res, error);
        }
    }
    static async deleteProduct(req, res) {
        try {
            const cartId = req.params.cid;
            const productId = req.params.pid;

            const result = await removeProductFromCartMongo(cartId, productId);

            if (result.status === 200) {
                res.status(200).json({ message: result.message, cart: result.cart });
            } else if (result.status === 404) {
                handleError(res, 'PRODUCT_REMOVAL_FAILED', result.error);
            } else {
                handleError(res, result.error);
            }
        } catch (error) {
            handleError(res, error);
        }
    }
    static async deleteAllProducts(req, res) {
        try {
            const cartId = req.params.cid;

            const result = await removeAllProductsFromCartMongo(cartId);

            if (result.status === 200) {
                res.status(200).json({ message: result.message, cart: result.cart });
            } else if (result.status === 404) {
                handleError(res, 'PRODUCTS_REMOVAL_FAILED', result.error);
            } else {
                handleError(res, result.error);
            }
        } catch (error) {
            handleError(res, error);
        }
    }
    static async updateCart(req, res) {
        try {
            const cartId = req.params.cid;
            const updatedProducts = req.body.products;

            const result = await updateCartMongo(cartId, updatedProducts);

            if (result.status === 200) {
                res.status(200).json({ message: result.message, cart: result.cart });
            } else if (result.status === 404) {
                handleError(res, 'CART_UPDATE_FAILED', result.error);
            } else {
                handleError(res, result.error);
            }
        } catch (error) {
            handleError(res, error);
        }
    }
    static async updateProductQuantity(req, res) {
        try {
            const cartId = req.params.cid;
            const productId = req.params.pid;
            const updatedQuantity = req.body.quantity;

            const result = await updateProductQuantityMongo(cartId, productId, updatedQuantity);

            if (result.status === 200) {
                res.status(200).json({ message: result.message, cart: result.cart });
            } else if (result.status === 404) {
                handleError(res, 'PRODUCT_QUANTITY_UPDATE_FAILED', result.error);
            } else {
                handleError(res, result.error);
            }
        } catch (error) {
            handleError(res, error);
        }

    }
    static async sendEmail(email, ticketDetails, productsPurchased) {
        try {
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
                subject: 'Detalle de tu compra',
                html: `
                    <h1>Detalle de tu compra</h1>
                    <p>Ticket: ${ticketDetails.code}</p>
                    <p>Fecha de compra: ${ticketDetails.purchase_Datetime}</p>
                    <h2>Productos comprados:</h2>
                    <ul>
                        ${productsPurchased.map(product => `<li>${product.quantity} x ${product.id} - $${product.price}</li>`).join('')}
                    </ul>
                    <p>Monto total: $${ticketDetails.amount}</p>
                `
            };

            await transporter.sendMail(mailOptions);
        } catch (error) {
            console.error('Error al enviar el correo electrónico:', error);
            throw error;
        }
    }
    static async purchaseTicket(req, res) {
        async function generateTicket(user, products) {
            try {
                const lastTicket = await TicketsModel.findOne().sort({ code: -1 });
    
                const nextTicketNumber = lastTicket ? parseInt(lastTicket.code.replace('TICKET-', '')) + 1 : 1;
    
                const ticketCode = `TICKET-${nextTicketNumber}`;
                const currentDatetime = new Date();
                const totalAmount = calculateTotal(products);

                const ticketDetails = {
                    purchaser: user.email,
                    code: ticketCode,
                    purchase_Datetime: currentDatetime,
                    amount: totalAmount,
                };
    
                return ticketDetails;
            } catch (error) {
                throw error;
            }
        }
    
        try {
            const cartId = req.params.cid;
            const cart = await CartsModelo.findOne({ _id: cartId }).lean();
            const user = req.session.user;
    
            if (!cart) {
                return res.status(404).json({ message: "Carrito no encontrado" });
            }
    
            const productsToPurchase = cart.products;
    
            const productsPurchased = [];
    
            for (const productInfo of productsToPurchase) {
                const product = await ProductosModelo.findById(productInfo.id);
    
                if (!product || !product.price) {
                    continue;
                }
    
                if (productInfo.quantity <= product.stock) {
                    product.stock -= productInfo.quantity;
                    await product.save();
    
                    productsPurchased.push({
                        id: productInfo.id,
                        quantity: productInfo.quantity,
                        price: product.price 
                    });
                }
            }
    
            const ticketDetails = await generateTicket(user, productsPurchased);
            const ticket = new TicketsModel(ticketDetails);
            await ticket.save();
    
            const remainingProducts = cart.products.filter(productInfo =>
                !productsPurchased.some(purchasedProduct => purchasedProduct.id === productInfo.id)
            );
            
            await updateCartMongo(cartId, remainingProducts);

            await cartController.sendEmail(user.email, ticketDetails, productsPurchased);
    
            res.render('ticket', { ticket: ticketDetails, productsPurchased });
        } catch (error) {
            handleError(res, error);
        }
        function calculateTotal(productsPurchased) {
            return productsPurchased.reduce((total, item) => {
                const itemPrice = parseFloat(item.price);
        
                if (itemPrice !== undefined && !isNaN(itemPrice)) {
                    return total + itemPrice * item.quantity;
                } else {
                    console.error(`Error: Precio no válido para el producto ${item.id}`);
                    console.log(item)
                    return total;
                }
            }, 0);
        }
    }

}



module.exports = cartController;