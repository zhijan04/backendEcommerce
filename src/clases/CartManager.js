const fs = require('fs');
const path = require('path');

const cartsFilePath = path.join(__dirname, '..', 'files', 'cart.json');

function loadCarts() {
    try {
        const cartsData = fs.readFileSync(cartsFilePath, 'utf-8');
        return JSON.parse(cartsData);
    } catch (error) {
        console.log('Error al cargar los carritos:', error.message);
        return {};
    }
}

function saveCarts(carts) {
    const cartsData = JSON.stringify(carts, null, 2);
    fs.writeFileSync(cartsFilePath, cartsData, 'utf-8');
    console.log('Carritos guardados correctamente.');
}

function createCart() {
    const carts = loadCarts();
    const cartId = generateUniqueId(carts);
    carts[cartId] = { id: cartId, products: {} };
    saveCarts(carts);
    console.log('Nuevo carrito creado:', cartId);
    return carts[cartId];
}

function getCart(cartId) {
    const carts = loadCarts();
    return carts[cartId];
}

function addProductToCart(cartId, productId, quantity) {
    const carts = loadCarts();
    const cart = carts[cartId];
    
    if (cart) {
        if (cart.products[productId]) {
            cart.products[productId] += quantity;
            console.log('Cantidad de producto actualizada en el carrito:', productId, 'Nueva cantidad:', cart.products[productId]);
        } else {
            cart.products[productId] = quantity; 
            console.log('Producto agregado al carrito:', productId, 'Cantidad:', quantity);
        }
        
        saveCarts(carts);
        return true;
    }
    
    console.log('Carrito no encontrado');
    return false;
}

function generateUniqueId(carts) {
    let lastId = 0;

    if (carts) {
        const cartIds = Object.keys(carts);
        if (cartIds.length > 0) {
            lastId = Math.max(...cartIds);
        }
    }

    return (lastId + 1).toString();
}

module.exports = {
    createCart,
    getCart,
    addProductToCart,
};
