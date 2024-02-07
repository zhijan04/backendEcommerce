const { createCartMongo, getAllCartsMongo, addProductToCartMongo, removeProductFromCartMongo, updateCartMongo, updateProductQuantityMongo, removeAllProductsFromCartMongo, getCartMongo } = require('../dao/CartManager.js')

function handleError(res, error) {
    console.error('Error:', error);
    res.status(500).json({ error: "Error de servidor" });
}


const TicketsModel = require("../dao/models/ticketsModel.js")
const ProductosModelo = require("../dao/models/productsModel.js")
const CartsModelo = require("../dao/models/cartsModel.js")

class cartController {
    constructor() { }

    static async getCarts(req, res) {
        try {
            const carts = await getAllCartsMongo();
            res.status(200).json(carts);
        } catch (error) {
            handleError(res, error);
        }
    }

    static async getIndvCart(req, res) {
        try {
            const cartId = req.params.cid;
            const cart = await cartsModelo.findOne({ _id: cartId }).lean();
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
            res.render('cartView', { products: cart.products, user, cartId });
        } catch (error) {
            handleError(res, error);
        }
    }
    static async addProductToCart(req, res) {
        try {
            const cartId = req.params.cid;
            const productId = req.params._id;
            const quantity = req.body.quantity;
            let user = req.session.user

            const result = await addProductToCartMongo(cartId, productId.toString(), quantity,);

            if (result.status === 200) {
                res.status(200).json({ success: true, message: "Producto agregado correctamente al carrito", cartId, user: user });
            } else {
                res.status(result.status).json({ error: result.message });
            }
        } catch (error) {
            handleError(res, error);
        }
    }
    static async createCart(req, res) {
        try {
            const cart = await createCartMongo();
            if (cart) {
                res.status(201).json({ message: `Carrito con id: ${cart._id} creado` });
            } else {
                handleError(res, "Error creando carrito");
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
                res.status(404).json({ error: result.error });
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
                res.status(404).json({ error: result.error });
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
                res.status(404).json({ error: result.error });
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
                res.status(404).json({ error: result.error });
            } else {
                handleError(res, result.error);
            }
        } catch (error) {
            handleError(res, error);
        }

    }
    static async purchaseTicket(req, res) {
        async function generateTicket(user, products) {
            try {
                // Obtener el último número de ticket generado
                const lastTicket = await TicketsModel.findOne().sort({ code: -1 });
    
                // Determinar el próximo número de ticket
                const nextTicketNumber = lastTicket ? parseInt(lastTicket.code.replace('TICKET-', '')) + 1 : 1;
    
                // Generar el código del ticket
                const ticketCode = `TICKET-${nextTicketNumber}`;
    
                // Aquí puedes incluir la lógica para generar un ticket
                const currentDate = new Date().toLocaleDateString(); // Ejemplo: Fecha actual
    
                // Puedes personalizar la lógica según tus requisitos
                const ticketDetails = {
                    user: user, // Agregar el usuario al ticket si es necesario
                    code: ticketCode,
                    date: currentDate,
                    products: products, // Agregar los productos al ticket
                    // Otros campos o detalles del ticket
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
    
            // Itera sobre los productos del carrito para verificar el stock y realizar la compra
            for (const productInfo of productsToPurchase) {
                const product = await ProductosModelo.findById(productInfo.id);
    
                if (!product) {
                    // Manejar el caso donde el producto no existe (podría haber sido eliminado)
                    continue;
                }
    
                // Verificar si la cantidad solicitada es mayor al stock disponible
                if (productInfo.quantity <= product.stock) {
                    // Hay suficiente stock para la compra
                    // Restar la cantidad comprada del stock del producto
                    product.stock -= productInfo.quantity;
                    await product.save();
                    
                    // Agregar el producto comprado a la lista
                    productsPurchased.push(productInfo);
                }
            }
    
            // Generar el ticket con los detalles de la compra
            const ticketDetails = await generateTicket(user, productsPurchased);
    
            // Guardar el ticket en la base de datos
            const ticket = new TicketsModel(ticketDetails);
            await ticket.save();
    
            // Filtrar los productos comprados y actualizar el carrito
            const remainingProducts = cart.products.filter(productInfo => !productsPurchased.includes(productInfo));
            await updateCartMongo(cartId, remainingProducts);
    
            // Devolver el ticket como respuesta JSON
            res.status(200).json({ ticket: ticketDetails, productsPurchased });
        } catch (error) {
            handleError(res, error);
        }
    }
}



module.exports = cartController;