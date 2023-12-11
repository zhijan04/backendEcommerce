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
async function removeProductFromCart(cartId, productId) {
    try {
        const cart = await cartsModelo.findOne({ _id: cartId });
        const productIndex = cart.products.findIndex(product => product.id === productId);

        if (productIndex !== -1) {
            cart.products.splice(productIndex, 1);

            const updatedCart = await cartsModelo.findOneAndUpdate(
                { _id: cartId },
                { $set: { products: cart.products } },
                { new: true }
            );

            return { message: "Producto eliminado del carrito correctamente.", status: 200, cart: updatedCart };
        } else {
            return { status: 404, error: "Producto no encontrado en el carrito." };
        }
    } catch (error) {
        console.error(error);
        return { status: 500, error: "Error al eliminar el producto del carrito." };
    }
}
async function updateCart(cartId, updatedProducts) {
    try {
        const cart = await cartsModelo.findOne({ _id: cartId });

        if (!cart) {
            return { status: 404, error: "Carrito no encontrado." };
        }

        cart.products = updatedProducts;

        const updatedCart = await cartsModelo.findOneAndUpdate(
            { _id: cartId },
            { $set: { products: updatedProducts } },
            { new: true } 
        );

        return { message: "Carrito actualizado correctamente.", status: 200, cart: updatedCart };
    } catch (error) {
        console.error(error);
        return { status: 500, error: "Error al actualizar el carrito." };
    }
}
async function updateProductQuantity(cartId, productId, updatedQuantity) {
    try {
        const cart = await cartsModelo.findOne({ _id: cartId });
        const productIndex = cart.products.findIndex(product => product.id === productId);

        if (productIndex !== -1) {
            // Actualizar la cantidad del producto
            cart.products[productIndex].quantity = updatedQuantity;

            const updatedCart = await cartsModelo.findOneAndUpdate(
                { _id: cartId },
                { $set: { products: cart.products } },
                { new: true } // Devuelve el carrito actualizado
            );

            return { message: "Cantidad del producto actualizada correctamente.", status: 200, cart: updatedCart };
        } else {
            return { status: 404, error: "Producto no encontrado en el carrito." };
        }
    } catch (error) {
        console.error(error);
        return { status: 500, error: "Error al actualizar la cantidad del producto en el carrito." };
    }
}
async function removeAllProductsFromCart(cartId) {
    try {
        const cart = await cartsModelo.findOne({ _id: cartId });

        if (!cart) {
            return { status: 404, error: "Carrito no encontrado." };
        }

        // Eliminar todos los productos del carrito
        cart.products = [];

        const updatedCart = await cartsModelo.findOneAndUpdate(
            { _id: cartId },
            { $set: { products: cart.products } },
            { new: true } // Devuelve el carrito actualizado
        );

        return { message: "Todos los productos del carrito eliminados correctamente.", status: 200, cart: updatedCart };
    } catch (error) {
        console.error(error);
        return { status: 500, error: "Error al eliminar todos los productos del carrito." };
    }
}


module.exports = {
    createCartMongo: createCart,
    getCartMongo: getCartById,
    addProductToCartMongo: addProductToCart,
    removeProductFromCartMongo: removeProductFromCart,
    updateCartMongo: updateCart,
    updateProductQuantityMongo: updateProductQuantity,
    removeAllProductsFromCartMongo: removeAllProductsFromCart
}
