const { describe, it } = require('mocha');
const { expect } = require('chai');
const supertest = require('supertest');
const mongoose = require('mongoose');
const config = require('../config/config.js');

describe('PRUEBA MODULO DE SESSIONS', function () {
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

    describe('Prueba Router sessions', function () {
        afterEach(function () {
        });

        it('Debería devolver un código de estado 302 ya que encuentra al usuario correctamente y lo esta redirigiendo al home', async function() {
            const credenciales = {
                email: 'asd@test.com', 
                password: '321' 
            };
            const respuesta = await requester.post('/api/sessions/login').send(credenciales);
            expect(respuesta.statusCode).to.equal(302);
            expect(respuesta.ok).to.be.false;

        })
        it('Debería devolver un código de estado 302 ya que registra el usuario y debe redirigir al usuario al "iniciar sesión" correctamente', async function() {
            const datosUsuario = {
                first_name: 'nombreUsuario',
                last_name: 'apellidoUsuario',
                email: 'correo@ejemplo.com',
                age: 200,
                password: 'contraseña'
            };
    
            const respuesta = await requester.post('/api/sessions/registro').send(datosUsuario);
    
            expect(respuesta.statusCode).to.equal(302);
            expect(respuesta.header.location).to.equal('/login?mensaje=Usuario%20registrado%20con%20%C3%A9xito.');
        });
        it('Debería devolver un código de estado 302, al no haber un usuario logueado, redirigue al usuario al "iniciar sesion" y un mensaje de error cuando no hay ningún usuario logueado', async function() {
            const respuesta = await requester.get('/api/sessions/logout');
            expect(respuesta.statusCode).to.equal(302);
        });
    });
});