const fs = require('fs').promises;
const path = require('path');

class CartsManager {
    constructor() {
        this.filePath = path.join(__dirname, '..', 'files', 'carts.json');
        this.productsFilePath = path.join(__dirname, '..', 'files', 'productos.json');
    }

    async initializeCartFile() {
        const defaultData = [];
        await this.saveCartsToJSON(defaultData);
    }

    async createCart() {
        try {
            const carts = await this.getCarts();
            const cartIdCounter = Math.max(...carts.map(cart => cart.id), 0) + 1;
            const newCart = {
                id: cartIdCounter,
                products: [],
            };
            carts.push(newCart);
            await this.saveCartsToJSON(carts);
            return newCart;
        } catch (error) {
            console.error('Error creando el nuevo carrito');
            return null;
        }
    }

    async getCartById(cartId) {
        const carts = await this.getCarts();
        const cart = carts.find(cart => cart.id === cartId);
        if (cart) {
            const products = await Promise.all(cart.products.map(async product => {
                const productData = await fs.readFile(this.productsFilePath, 'utf8');
                const products = JSON.parse(productData);
                const productObj = products.find(p => p.id === product.id);
                return { ...product, ...productObj };
            }));
            return { ...cart, products };
        } else {
            return "Carrito no encontrado.";
        }
    }

    async saveCartsToJSON(carts) {
        try {
            const data = JSON.stringify(carts, null, 2);
            await fs.writeFile(this.filePath, data);
        } catch (error) {
            console.error('Error guardando carrito:');
        }
    }

    async getCarts() {
        try {
            let data;
            try {
                data = await fs.readFile(this.filePath, 'utf8');
            } catch (error) {
                await this.initializeCartFile();
                data = await fs.readFile(this.filePath, 'utf8');
            }
            return JSON.parse(data);
        } catch (error) {
            console.error('Error al leer carrito:');
            return [];
        }
    }

    async addProductToCart(cartId, productId) {
        try {
            const carts = await this.getCarts();
            const cartIndex = carts.findIndex(cart => cart.id === cartId);

            if (cartIndex === -1) {
                return { error: "Carrito no encontrado.", status: 404 };
            }

            const cart = carts[cartIndex];

            const productData = await fs.readFile(this.productsFilePath, 'utf8');
            const products = JSON.parse(productData);
            const productIndex = products.findIndex(p => p.id === productId);

            if (productIndex === -1) {
                return { error: "Producto no encontrado.", status: 400 };
            }

            const cartProductIndex = cart.products.findIndex(product => product.id === productId);

            if (cartProductIndex === -1) {
                cart.products.push({ id: productId, quantity: 1 });
            } else {
                cart.products[cartProductIndex].quantity++;
            }

            await this.saveCartsToJSON(carts);
            return { message: "Producto agregado al carrito correctamente.", status: 200 };
        } catch (error) {
            console.error('Error al agregar producto al carrito');
            return { error: "Error al agregar producto al carrito.", status: 500 };
        }
    }
}

module.exports = CartsManager;