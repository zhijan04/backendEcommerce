const express = require('express');
const router = express.Router();
const passport = require('passport');
const Usuario = require('../dao/models/usuariosModel.js')
const bcrypt = require('bcrypt');

router.post('/login', (req, res, next) => {
    passport.authenticate('login', (err, user, info) => {
        if (err) {
            return next(err)
        }
        if (!user) {
            return res.redirect('/login?error=' + info.message)
        }

        req.session.user = {
            nombre: user.nombre,
            email: user.email,
            rol: user.rol
        }
        res.redirect('/');
    })(req, res, next)
})

router.post('/registro',
    passport.authenticate('registro', {
        successRedirect: '/login?mensaje=Usuario registrado con éxito.',
        failureRedirect: '/registro',
        failureFlash: true
    })
);

router.get('/logout', (req, res) => {
    req.session.destroy(error => {
        if (error) {
            res.redirect('/login?error=Fallo al cerrar sesión.');
        }
    });
    res.redirect('/login');
});

router.get('/github', passport.authenticate('github', {}), (req, res) => {
});

router.get('/callbackGithub', passport.authenticate('github', { failureRedirect: "/api/sessions/errorGitHub" }), (req, res) => {
    req.session.user = req.user
    res.redirect('/productos?message=You logged in correctly');
});

router.get('/errorGitHub', (req, res) => {

    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({
        error: "error al autenticar con gitHub"
    });
});

module.exports = {
    routerSession: router
};