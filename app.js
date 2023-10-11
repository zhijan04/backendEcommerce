class ProductManager {
    constructor() {
        this.products = [];
        this.nextProductCode = 1;
    }

    getProducts() {
        return this.products;
    }

    addProduct(title, description, price, thumbnail, stock) {
        const code = this.nextProductCode;
        this.nextProductCode++; 

        const existingProduct = this.products.find(product => product.code === code);

        if (existingProduct) {
            console.error("Ya existe un producto con ese código.");
            return; 
        }

        let product = {
            code,
            title,
            description,
            price,
            thumbnail,
            stock
        };

        this.products.push(product);
    }
    getProductById(code) {
        if (this.products.find(product => product.code === code)){
        return this.products.find(product => product.code === code);
        }
        else{
            console.error("No existe un producto con ese código.");
        
        }
    }
}

let productManager = new ProductManager();
productManager.addProduct("producto prueba", "Este es un producto prueba", 200, "Sin imagen2", 25);
console.log(productManager.getProducts()); 
console.log(productManager.getProductById(2))