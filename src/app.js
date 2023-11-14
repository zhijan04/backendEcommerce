const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const { engine } = require('express-handlebars');
const app = express();
const { Server } = require ('socket.io')
const PORT = 3000;

const productRouter = require('./rutas/ProductRouter'); 
const ProductManager = require('./clases/ProductManager');
const cartRouter = require('./rutas/cartRouter');
const viewRouter = require('./rutas/ViewRouter');


const productManager = new ProductManager(http);

app.engine('handlebars', engine());
app.set('view engine', 'handlebars');

app.set('views', './src/views');

app.use(express.json());
app.use(express.static('public'));

app.use('/api/products', productRouter);

app.use('/api/carts', cartRouter);

app.use('/', viewRouter);  

app.use('/realtimeproducts', viewRouter);

app.get('/', async (req, res) => {
    try {
        const products = await productManager.getProducts();
        res.render('home', { products });
    } catch (error) {
        console.error('Error al cargar productos en la página de inicio:', error);
        res.status(500).json({ error: "Error de servidor" });
    }
});

app.use((req, res) => {
    res.status(404).json({ message: "Página no encontrada, por favor dirigirse a /api/products o /api/carts" });
});

// io.on('connection', (socket) => {
//     console.log('Usuario conectado');

//     socket.on('disconnect', () => {
//         console.log('Usuario desconectado');
//     });
// });

const server = app.listen(PORT, () => {
    console.log(`Servidor en línea en el puerto ${PORT}`);
});

const io = new Server(server);

module.exports = io;