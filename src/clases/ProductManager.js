const fs = require('fs').promises;
const path = require('path');

class ProductManager {
    constructor() {
        this.filePath = path.join(__dirname, '..', 'files', 'productos.json');
    }

    async addProductRawJSON(productData) {
        try {
            const products = await this.getProducts();
    
            if (products.some(product => product.code === productData.code)) {
                return "Ya existe un producto con ese código.";
            }
    
            const productIdCounter = Math.max(...products.map(product => product.id), 0) + 1;
            const newProduct = {
                id: productIdCounter,
                ...productData,
            };
    
            products.push(newProduct);
            await this.saveProductsToJSON(products);
            return "Producto agregado correctamente.";
        } catch (error) {
            console.error('Error agregando producto:');
            return "Error agregando producto.";
        }
    }

    async getProducts() {
        try {
            let data;
            try {
                data = await fs.readFile(this.filePath, 'utf8');
            } catch (error) {
                await this.saveProductsToJSON([]);
                data = await fs.readFile(this.filePath, 'utf8');
            }
            return JSON.parse(data);
        } catch (error) {
            console.error('Error al leer producto:');
            return [];
        }
    }

    async getProductById(pid) {
        const products = await this.getProducts();
        const product = products.find(product => product.id === pid);
        return product || undefined;
    }

    async updateProduct(id, updates) {
        const products = await this.getProducts();
        const productIndex = products.findIndex(product => product.id === id);
        if (productIndex === -1) {
            return "Producto no encontrado.";
        }
        const updatedProduct = { ...products[productIndex], ...updates };
        products[productIndex] = updatedProduct;
        await this.saveProductsToJSON(products);
        return "Producto actualizado correctamente.";
    }

    async saveProductsToJSON(products) {
        try {
            const data = JSON.stringify(products, null, 2);
            await fs.writeFile(this.filePath, data);
        } catch (error) {
            console.error('Error guardando el producto:');
        }
    }

    async deleteProduct(pid) {
        try {
            const products = await this.getProducts();
            const productIndex = products.findIndex(product => product.id === pid);
            if (productIndex === -1) {
                return null;
            }
    
            products.splice(productIndex, 1);
            await this.saveProductsToJSON(products);
            console.log(`Producto con ID ${pid} eliminado.`);
            
            return "Producto eliminado correctamente.";
        } catch (error) {
            console.error('Error eliminando producto:');
            return "Error al eliminar el producto.";
        }
    }
}

module.exports = ProductManager;