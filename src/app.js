const express = require('express');
const PORT = 3000;
const app = express();
const productRouter = require('./rutas/ProductRouter'); 
const cartRouter = require('./rutas/cartRouter');


//SE PONE A FUNCIONAR EL SERVIDOR //
app.use(express.json());

app.use('/api/products', productRouter);

app.use('/api/carts', cartRouter);

app.get('/', (req, res) => {
    res.send("<h1>¡Bienvenidos! Para ingresar a los productos, por favor diríjase a localhost:3000/api/products o /api/carts. ¡Muchas gracias!</h1>");
});
app.use((req, res) => {
    res.status(404).json({ message: "Página no encontrada, por favor dirigirse a /api/products o /api/carts" });
});

const server = app.listen(PORT, () => {
    console.log('server online')
});