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
    updateProduct(id, field, value) {
        const productIndex = this.products.findIndex((product) => product.id === id);
    
        if (productIndex === -1) {
            console.error("Product not found");
            return;
        }

        if (this.products[productIndex].hasOwnProperty(field)){
            this.products[productIndex][field] = value;

        }else{
            console.log("Field not found")
        }
    }
    deleteProduct(id){
        const DelProduct = this.products.findIndex((product) => product.id === id);
        if(DelProduct === -1){
            console.log("You cannot delete a product that your id cannot find.")            
        }

        else if (this.products[DelProduct] && this.products[DelProduct].id === id){
            this.products.splice(DelProduct, 1);
            console.log(`Product with id: ${id} deleted successfully`)
        };

    }
    


    }

let productManager = new ProductManager();
//A PARTIR DE ABAJO, SE COMPRUEBA EL FUNCIONAMIENTO 
productManager.addProduct("as1","producto prueba", "Este es un producto prueba", 200, "Sin imagen", 25);
productManager.addProduct("as12","producto prueba2", "Este es un producto prueba2", 200, "Sin imagen2", 25);


//EDIT
console.log(productManager.updateProduct(2, "title", "nuevo titulo"))
// //DELETE
console.log(productManager.deleteProduct(2));
// //LIST
console.log(productManager.getProducts()); 
// //GETPRODUCTOBYID
console.log(productManager.getProductById(2))