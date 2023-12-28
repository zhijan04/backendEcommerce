const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const { engine } = require('express-handlebars');
const app = express();
const PORT = 3000;
const path = require('path');
const mongoose = require('mongoose');
const ChatMessage = require('./dao/models/chatModel.js');
const sessions = require('express-session');
const mongoStore = require('connect-mongo')
const { routerSession } = require('./rutas/sessionRouter.js');

const productRouter = require('./rutas/ProductRouter');
const ProductManager = require('./clases/ProductManager');
const cartRouter = require('./rutas/cartRouter');
const viewRouter = require('./rutas/ViewRouter');

const productManager = new ProductManager(http);

const server = http.createServer(app);
const io = socketIO(server);
const cookieParser = require('cookie-parser');
const { initPassport } = require('./config/config.passport.js');
const passport = require ('passport')


app.use(sessions(
    {
        secret:"adminCod3r123",
        resave: true, saveUninitialized: true,
        store: mongoStore.create(
            {
                mongoUrl:"mongodb+srv://leoben:coder@ecommerce.56z7kdm.mongodb.net/?retryWrites=true&w=majority",
                mongoOptions:{dbName: 'ecommerce'},
                ttl: 3600
            }
        )
    }
))
initPassport()
app.use(passport.initialize())
app.use(passport.session())

app.use(cookieParser());

app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname + '/views'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/public', express.static(__dirname + '/public'));;

app.use('/api/products', productRouter);

app.use('/api/carts', cartRouter);

app.use('/', viewRouter);

app.use('/api/sessions', routerSession)

app.use('/realtimeproducts', viewRouter);

app.get('/chat', (req, res) => {
    res.render('chat');
});


app.use((req, res) => {
    res.status(404).json({ message: "Página no encontrada, por favor dirigirse a /api/products o /api/carts" });
});

io.on('connection', (socket) => {
    console.log('Usuario conectado');

    socket.on('set username', (username) => {
        socket.username = username;
        console.log(`Usuario ${username} conectado`);

        ChatMessage.find().then((messages) => {
            socket.emit('chat history', messages);
        }).catch((err) => {
            console.error(err);
        });
    });
    socket.on('chat message', (message) => {
        if (!socket.username) {
            console.error('Usuario sin nombre intentando enviar un mensaje');
            return;
        }

        const data = {
            user: socket.username,
            message: message
        };

        const newMessage = new ChatMessage(data);
        newMessage.save()
            .then(() => {
                io.emit('chat message', data);
            })
            .catch((err) => {
                console.error(err);
            });
    });

    socket.on('disconnect', () => {
        console.log('Usuario desconectado');
    });
});

app.set("socket", io)

server.listen(PORT, () => {
    console.log(`Servidor en línea en el puerto ${PORT}`);
});

try {
    //CAMBIAR LA CLAVE POR <PASSWORD>
    mongoose.connect("mongodb+srv://leoben:coder@ecommerce.56z7kdm.mongodb.net/?retryWrites=true&w=majority", { dbName: 'ecommerce' })
    console.log("db online")

} catch (error) {
    console.log(error.message)
}