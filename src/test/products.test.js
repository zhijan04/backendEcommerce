const { describe, it } = require('mocha');
const { expect } = require('chai');
const supertest = require('supertest');
const mongoose = require('mongoose');
const config = require('../config/config.js');

describe('PRUEBA MODULO DE PRODUCTS', function () {
    this.timeout(7000);
    before(async function () {
        try {
            mongoose.connect(config.DBURL, { dbName: config.DBNAME })
            console.log("BD Online");
        } catch (error) {
            console.log(error.message);
            process.exit(1);
        }
    });
    after(async function () {
        await mongoose.disconnect();
        console.log("BD Desconectada");
    });

    const requester = supertest('http://localhost:3000');

    describe('Prueba Router products', function () {
        afterEach(function () {
        });

        it('Prueba endpoint GET /api/products. => debe devolver el array en formato json de todos los productos disponibles del ecommerce', async function () {
            const respuesta = await requester.get("/api/products");
            console.log('Cuerpo de la respuesta:', respuesta.body);
            expect(respuesta.statusCode).to.be.equal(200);
            expect(respuesta.ok).to.be.true;
        });

        it('Prueba endpoint GET /api/products/:pid. => debe devolver el array en formato json de todos los productos disponibles del ecommerce', async function () {
            const productId = '656e55742126c4b456aac175';
            const respuesta = await requester.get(`/api/products/${productId}`);
            console.log("cuerpo del producto testeado:", respuesta.body);
            expect(respuesta.statusCode).to.equal(200);
            expect(respuesta.ok).to.be.true;
        });
        it('Debería devolver un código de estado 500 si no hay usuario logueado.', async function() {
            const nuevoProducto = {
                title: 'Producto de prueba',
                price: 50,
                stock: 20,
                description: "test producto",
                category: "test"
            };
            const respuesta = await requester.post('/api/products').send(nuevoProducto);
            console.log("no permite agregar un producto ya que no hay ningun usuario logueado, por lo tanto, no encuentra el 'rol' del usuario para verificar si es un administrador o usuario.")
            expect(respuesta.statusCode).to.equal(500);
            expect(respuesta.ok).to.be.false;
        });
    });
});

