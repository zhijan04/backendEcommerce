const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const { engine } = require('express-handlebars');

const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();

const options={
    definition:{
        openapi:"3.0.0",
        info:{
            title: "API Backend ecommerce",
            version: "1.0.0",
            description: "documentacion ecommerce backend"
        }
    },
    apis:["./docs/*.yaml"]
}
const specs=swaggerJsdoc(options)


const config = require("./config/config.js")
const PORT = config.PORT;
const path = require('path');
const mongoose = require('mongoose');
const ChatMessage = require('./dao/models/chatModel.js');
const sessions = require('express-session');
const mongoStore = require('connect-mongo')
const flash = require('express-flash');
const { routerSession } = require('./rutas/sessionRouter.js');

const logger = require('./controllers/logger.js');

const productRouter = require('./rutas/ProductRouter.js');
const ProductManager = require('./clases/ProductManager.js');
const cartRouter = require('./rutas/cartRouter.js');
const viewRouter = require('./rutas/ViewRouter.js');
const userRouter = require('./rutas/userRouter.js');
const mockingModule = require('./DTO/mockingModule.js')

const productManager = new ProductManager(http);
const server = http.createServer(app);
const io = socketIO(server);
const cookieParser = require('cookie-parser');
const { initPassport } = require('./config/config.passport.js');
const passport = require('passport')


app.use(sessions(
    {
        secret: config.SECRETKEY,
        resave: true, saveUninitialized: true,
        store: mongoStore.create(
            {
                mongoUrl: config.DBURL,
                mongoOptions: { dbName: config.DBNAME },
                ttl: 3600
            }
        )
    }
))
app.use(flash());
initPassport()
app.use(passport.initialize())
app.use(passport.session())

app.use((req, res, next) => {
    res.locals.user = req.user;
    next();
});

app.use(cookieParser());

app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname + '/views'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/public', express.static(__dirname + '/public'));;

app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(specs))

app.use('/api/products', productRouter);

app.use('/api/carts', cartRouter);

app.use('/', viewRouter);

app.use('/api/sessions', routerSession)

app.use('/api/users', userRouter);

app.use('/realtimeproducts', viewRouter);

app.get('/chat', (req, res) => {
    let usuario = req.session.user
    res.render('chat', { usuario });
});

app.get('/mockingproducts', async (req, res) => {
    try {
        const mockedProducts = await mockingModule.generateMockedProducts(100);
        res.json(mockedProducts);
    } catch (error) {
        res.status(500).json({ error: 'Error en la ruta /mockingproducts' });
    }
});
app.get('/loggerTest', (req, res) => {
    logger.debug('Mensaje de debug');
    logger.http('Mensaje HTTP');
    logger.info('Mensaje informativo');
    logger.warning('Mensaje de advertencia');
    logger.error('Mensaje de error');
    logger.fatal('Mensaje fatal');

    res.send('Verifica la consola o el archivo "logs/errors.log" para ver los logs.');
});


app.use((req, res) => {
    res.status(404).json({ message: "Página no encontrada, por favor dirigirse a /api/products o /api/carts" });
});

io.on('connection', (socket) => {
    socket.on('set username', (username) => {
        socket.username = username;
        logger.info(`Usuario ${username} conectado`);

        ChatMessage.find().then((messages) => {
            socket.emit('chat history', messages);
        }).catch((err) => {
            logger.error(err);
        });
    });
    socket.on('chat message', (message) => {
        if (!socket.username) {
            logger.error('Usuario sin nombre intentando enviar un mensaje');
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
                logger.error(err);
            });
    });

    socket.on('disconnect', () => {
        logger.info('Usuario desconectado');
    });
});

app.set("socket", io)

server.listen(PORT, () => {
    logger.info(`Servidor en línea en el puerto ${PORT}`);
});

try {
    mongoose.connect(config.DBURL, { dbName: config.DBNAME })
    logger.info("db online")

} catch (error) {
    logger.error(error.message)
}