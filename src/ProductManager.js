const fs = require('fs');
const path = require('path');

class ProductManager {
    constructor() {
        this.path = path.join(__dirname, 'productos.json');
    }

    async getProducts(limit = 0) {
        if (fs.existsSync(this.path)) {
            let products = JSON.parse(await fs.promises.readFile(this.path, "utf-8"));
            if (limit > 0) {
                products = products.slice(0, limit);
            }
            return products;
        }
        return [];
    }

    async getProductById(id) {
        let products = await this.getProducts();
        const foundProduct = products.find((product) => product.id === id);
        if (foundProduct) {
            return foundProduct;
        } else {
            console.error("Product not found, please insert another id.");
            return null;
        }
    }

    async addProduct(code, title, description, price, thumbnail, stock) {
        let products = await this.getProducts();
        const id = products.length > 0 ? Math.max(...products.map((p) => p.id)) + 1 : 1;

        const existingProduct = products.find((product) => product.code === code);

        if (existingProduct) {
            console.error("Ya existe un producto con ese código.");
            return;
        }

        let product = {
            id,
            title,
            description,
            price,
            thumbnail,
            code,
            stock,
        };

        products.push(product);
        await this.saveFile(products);
    }

    async updateProduct(id, field, value) {
        let products = await this.getProducts();
        const productIndex = products.findIndex((product) => product.id === id);

        if (productIndex === -1) {
            console.error("Product not found");
            return;
        }

        if (products[productIndex].hasOwnProperty(field)) {
            products[productIndex][field] = value;
            await this.saveFile(products);
        } else {
            console.log("Field not found");
        }
    }

    async deleteProduct(id) {
        let products = await this.getProducts();
        const productIndex = products.findIndex((product) => product.id === id);

        if (productIndex === -1) {
            console.log("Product not found");
            return;
        }

        products.splice(productIndex, 1);
        await this.saveFile(products);
        console.log(`Product with id: ${id} deleted successfully`);
    }

    async saveFile(products) {
        try {
            await fs.promises.writeFile(this.path, JSON.stringify(products, null, 2));
        } catch (error) {
            console.log(' Something has gone wrong saving the product. ');
        }
    }
}
module.exports = ProductManager;
