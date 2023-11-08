const fs = require('fs');
const path = require('path');

const cartsFilePath = path.join(__dirname, '..', 'files', 'cart.json');

function loadCarts() {
    try {
        const cartsData = fs.readFileSync(cartsFilePath, 'utf-8');
        return JSON.parse(cartsData);
    } catch (error) {
        console.log('Error al cargar los carritos:', error.message);
        return { carts: [], lastCartId: 0 };
    }
}

function saveCarts(carts) {
    const cartsData = JSON.stringify(carts, null, 2);
    fs.writeFileSync(cartsFilePath, cartsData, 'utf-8');
    console.log('Carritos guardados correctamente.');
}

function createCart() {
    const carts = loadCarts();
    const newCartId = generateUniqueId(carts); // Obtener un nuevo ID único
    const newCart = { id: newCartId, products: [], status: true, thumbnails: [] };
    carts.carts.push(newCart);
    carts.lastCartId = newCartId; // Actualiza el último ID
    saveCarts(carts);
    console.log('Nuevo carrito creado con ID:', newCartId);
    return newCart;
}

function getCart(cartId) {
    const cartsData = loadCarts();
    cartId = parseInt(cartId); // Convierte cartId a número
    const cart = cartsData.carts.find(cart => cart.id === cartId);
    if (cart) {
        console.log('Carrito encontrado:', cart);
        return cart;
    } else {
        console.log("Carrito no encontrado");
        return null;
    }
}

function addProductToCart(cartId, productId, quantity) {
    const carts = loadCarts();
    const cartIdInt = parseInt(cartId); // Asegúrate de que cartId sea un número entero

    // Busca el carrito en la lista de carritos
    const cartIndex = carts.carts.findIndex(cart => cart.id === cartIdInt);

    if (cartIndex !== -1) {
        const cart = carts.carts[cartIndex];

        // Verifica si el producto ya existe en el carrito
        const productIndex = cart.products.findIndex(product => product.id === productId);

        if (productIndex !== -1) {
            // Si el producto existe, actualiza la cantidad
            cart.products[productIndex].quantity += quantity;
            console.log('Cantidad de producto actualizada en el carrito:', productId, 'Nueva cantidad:', cart.products[productIndex].quantity);
        } else {
            // Si el producto no existe, agrégalo al carrito
            const newProduct = { id: productId, quantity };
            cart.products.push(newProduct);
            console.log('Producto agregado al carrito:', productId, 'Cantidad:', quantity);
        }

        // Guarda los cambios en el archivo
        saveCarts(carts);
        return true;
    } else {
        console.log('Carrito no encontrado');
        return false;
    }
}

function generateUniqueId() {
    const cartsData = loadCarts();
    cartsData.lastCartId += 1; // Incrementa el último ID de carrito
    saveCarts(cartsData);
    return cartsData.lastCartId; // Devuelve el nuevo ID único
}

module.exports = {
    createCart,
    getCart,
    addProductToCart,
};