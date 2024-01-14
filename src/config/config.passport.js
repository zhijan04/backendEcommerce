const passport = require('passport');
const github = require('passport-github2');
const usuariosModelo = require('../dao/models/usuariosModel.js')
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const CartManager = require('../dao/CartManager.js');
const initPassport = () => {
    passport.use('github', new github.Strategy(
        {
            clientID: 'Iv1.402d1e02f6b24f57',
            clientSecret: 'd5935cfa37a626b266f71c3aa00c2d1fee77df63',
            callbackURL: 'http://localhost:3000/api/sessions/callbackGitHub'
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                let usuario = await usuariosModelo.findOne({ email: profile._json.email })
                if (!usuario) {
                    let nuevoUsuario = {
                        nombre: profile._json.name,
                        email: profile._json.email,
                        profile
                    }

                    usuario = await usuariosModelo.create(nuevoUsuario)
                }
                return done(null, usuario)


            } catch (error) {
                return done(error)
            }
        }
    ))
    passport.use('login', new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
    },
        async (req, email, password, done) => {
            try {
                if (!email || !password) {
                    return done(null, false, req.flash('error', 'Complete todos los datos'));
                }

                const usuario = await usuariosModelo.findOne({ email: email });

                if (!usuario) {
                    return done(null, false, req.flash('error', 'Datos incorrectos'));
                }

                const passwordMatch = await bcrypt.compare(password, usuario.password);

                if (!passwordMatch) {
                    return done(null, false, req.flash('error', 'Datos incorrectos'));
                }

                const userObject = {
                    nombre: usuario.nombre,
                    email: usuario.email,
                    rol: usuario.rol
                };

                return done(null, userObject);
            } catch (error) {
                return done(error);
            }
        }
    ));
    passport.use('registro', new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
    },
        async (req, email, password, done) => {
            try {
                const { first_name, last_name, age, email, password } = req.body;

                if (!first_name || !last_name || !email || !password || !age ) {
                    return done(null, false, req.flash('error', 'Complete todos los datos'));
                } 
                if (parseInt(age) < 1) {
                    return done(null, false, { message: 'Error! la edad no puede ser menor de 1.' })
                }

                const regEmail = /^(([^<>()\[\]\\.,;:\s@”]+(\.[^<>()\[\]\\.,;:\s@”]+)*)|(“.+”))@((\[[0–9]{1,3}\.[0–9]{1,3}\.[0–9]{1,3}\.[0–9]{1,3}])|(([a-zA-Z\-0–9]+\.)+[a-zA-Z]{2,}))$/;

                if (!regEmail.test(email)) {
                    return done(null, false, req.flash('error', 'Email con formato incorrecto'));
                }

                const existe = await usuariosModelo.findOne({ email: email });

                if (existe) {
                    return done(null, false, req.flash('error', `Ya existe un usuario con el email ${email} en la base de datos`));
                }

                let rol = 'user';
                if (email === 'adminCoder@coder.com') {
                    rol = 'admin';
                }

                const hashedPassword = await bcrypt.hash(password, 10);

                let usuario;
                try {
                    const carritoNuevo = await CartManager.createCartMongo();
                    const carritoId = carritoNuevo._id;
                    usuario = await usuariosModelo.create({ first_name, last_name, email, password: hashedPassword, rol, age });
                    return done(null, usuario);
                } catch (error) {
                    return done(null, false, req.flash('error', 'Error inesperado, reintentelo.'));
                }
            } catch (error) {
                return done(error);
            }
        }
    ));
    passport.serializeUser((user, done) => {
        done(null, user.email);
    });

    passport.deserializeUser(async (email, done) => {
        try {
            const usuario = await usuariosModelo.findOne({ email: email });
            done(null, {
                nombre: usuario.nombre,
                email: usuario.email,
                rol: usuario.rol
            });

            console.log("usuario",usuario)
        } catch (error) {
            done(error, null);
        }
    });
}

module.exports = { initPassport, passport };