const { describe, it } = require('mocha');
const { expect } = require('chai');
const supertest = require('supertest');
const mongoose = require('mongoose');
const config = require('../config/config.js');

describe('PRUEBA MODULO DE CARTS', function () {
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

    describe('Prueba Router carritos', function () {
        afterEach(function () {
        });

        it('Prueba endpoint GET /api/carts. => debe devolver el array en formato json de todos los carritos creados del ecommerce', async function () {
            const respuesta = await requester.get("/api/carts");
            console.log('Cuerpo de la respuesta METODO GET:', respuesta.body);
            expect(respuesta.statusCode).to.be.equal(200);
            expect(respuesta.ok).to.be.true;
        });
        it('Prueba endpoint POST /api/carts. => debe devolver el array en formato json de un carrito nuevo creado del ecommerce', async function () {
            const respuesta = await requester.post("/api/carts");
            console.log('Cuerpo de la respuesta METODO POST:', respuesta.body);
            expect(respuesta.statusCode).to.be.equal(201);
            expect(respuesta.ok).to.be.true;
        });
        it('Debería fallar al agregar un producto al carrito y devolver un código de estado 401 ya que no se encuentra logueado ningun usuario.', async function() {
            const cartId = '6575ddb4801e056796a39171';
            const productId = '656e55742126c4b456aac176'; 
            const respuesta = await requester.post(`/api/carts/${cartId}/product/${productId}`);
            console.log('Cuerpo de la respuesta al agregar un producto al carrito:', respuesta.body);
    
            expect(respuesta.statusCode).to.equal(401);
        });
    });
});

