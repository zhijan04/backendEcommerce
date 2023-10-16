class ProductManager {
    constructor() {
        this.products = [];
        this.nextProductId = 1;
    }

    getProducts() {
        return this.products;
    }

    addProduct(code, title, description, price, thumbnail, stock) {
        const id = this.nextProductId;
        this.nextProductId++; 

        const existingProduct = this.products.find(product => product.code === code);

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
            stock
        };

        this.products.push(product);
    }
    getProductById(id) {
        const found_product = this.products.find((product) => product.id === id)
        if (found_product){
        return found_product;
        }
        else{
            console.error("Not found");
            return;
        }
    }
}
let productManager = new ProductManager();
//A PARTIR DE ABAJO, SE COMPRUEBA EL FUNCIONAMIENTO 
productManager.addProduct("as1","producto prueba", "Este es un producto prueba", 200, "Sin imagen2", 25);
console.log(productManager.getProducts()); 
console.log(productManager.getProductById(2))