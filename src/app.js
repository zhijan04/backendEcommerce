const express = require ('express')

const ProductManager = require('./ProductManager'); 

const PORT=3000;

const app = express();

const productManager = new ProductManager();

productManager.getProducts();
// SE AGREGAN LOS PRODUCTOS //
productManager.addProduct("RP001","Camisa de manga corta", "Camisa de algodón de manga corta para hombres", 29.99, "camisa_manga_corta.jpg", 25);
productManager.addProduct("RP002","Vestido de noche elegante", "Vestido largo de noche para ocasiones especiales", 89.99, "vestido_noche.jpg", 10);
productManager.addProduct("RP003","Pantalones vaqueros clásicos", "Jeans de corte recto para mujeres", 39.99, "pantalones_jeans.jpg", 15);
productManager.addProduct("RP004","Chaqueta deportiva", "Chaqueta deportiva resistente al viento para exteriores", 49.99, "chaqueta_deportiva.jpg", 10);
productManager.addProduct("RP005","Vestido de verano", "Vestido corto de verano con estampado floral", 34.99, "vestido_verano.jpg", 25);
productManager.addProduct("RP006","Blusa de encaje", "Blusa de encaje elegante para ocasiones formales", 45.99, "blusa_encaje.jpg", 15);
productManager.addProduct("RP007","Shorts deportivos", "Shorts deportivos cómodos para actividades al aire libre", 19.99, "shorts_deportivos.jpg", 15);
productManager.addProduct("RP008","Vestido de cóctel", "Vestido de cóctel con detalles de encaje", 59.99, "vestido_coctel.jpg", 10);
productManager.addProduct("RP009","Jersey de lana", "Jersey cálido de lana para días fríos de invierno", 39.99, "jersey_lana.jpg", 20);
productManager.addProduct("RP010","Traje de baño de dos piezas", "Conjunto de traje de baño de dos piezas para mujeres", 29.99, "traje_baño.jpg", 25);

//SE PONE A FUNCIONAR EL SERVIDOR //

app.get('/', (req, res) => {
    res.send("<h1>¡Bienvenidos¡ para ingresar a los productos porfavor dirigirse al localhost:3000/products, muchas gracias...</h1>")
})

app.get('/products', (req, res) => {
    const limit = parseInt(req.query.limit);

    if (limit) {
        const limitedProducts = productManager.getProducts().slice(0, limit);
        res.json(limitedProducts);
    } else {
        const allProducts = productManager.getProducts();
        res.json(allProducts);
    }
});


app.get('/products/:pid', (req, res) => {
    const pid = parseInt(req.params.pid);
    const product = productManager.getProductById(pid);

    if (product) {
        res.json(product);
    } else {
        res.status(404).json({ error: 'Producto no encontrado' });
    }
});


const server=app.listen(PORT, () =>{
console.log('server online')
});