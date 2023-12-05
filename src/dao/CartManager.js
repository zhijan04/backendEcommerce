const cartsModelo = require('../dao/models/cartsModel.js')

async function createCart() {
    try {
        const cart = await cartsModelo.create({})
        return cart
    }
    catch (error) {
        console.log(error)
        return {
            message: "Ha ocurrido un error al crear un carrito."
        };
    }
}

async function getCartById(_cid) {
    try {
        const cart = await cartsModelo.findOne({ _id: _cid });
        console.log(cart)

        if (!cart) {
            return {
                message: "No existe un Carrito con ese ID."
            };
        } else {
            return {
                message: "Carrito encontrado correctamente.",
                cart: cart
            };
        }
    } catch (error) {
        console.log(error);
        return {
            message: "Error obteniendo el carrito por ID."
        };
    }
}

async function addProductToCart(cartId, productId) {
    try {
        const cart = await cartsModelo.findOne({ _id: cartId });
        const productIndex = cart.products.findIndex(product=>product.id === productId);

        if(productIndex!=-1){
            cart.products[productIndex]={id: productId, quantity: cart.products[productIndex].quantity +1}
            const products = cart.products
            await cartsModelo.findOneAndUpdate({_id: cartId}, {$set:{products:products}})
        }else{
            const products = cart.products
            const newProduct = products.push({id: productId, quantity: 1})
            await cartsModelo.findOneAndUpdate({_id: cartId}, {$set:{products: products}});
        }
        return { message: "Producto agregado al carrito correctamente.", status: 200 };
    }
    catch (error) {
        console.log(error);
        return {
            message: "Error al agregar un producto al carrito."
        };
    }
}



module.exports = {
    createCartMongo: createCart,
    getCartMongo: getCartById,
    addProductToCartMongo: addProductToCart
}
