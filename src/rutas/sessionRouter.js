const express = require('express');
const router = express.Router();
const passport = require('passport');
const Usuario = require('../dao/models/usuariosModel.js')
const bcrypt = require('bcrypt');

router.post('/login',
    passport.authenticate('login', {
        successRedirect: '/productos',
        failureRedirect: '/login',
        failureFlash: true
    })
);

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

router.get('/github', passport.authenticate('github', { failureRedirect: "/api/sessions/errorGitHub" }), (req, res) => { })

router.get('/callbackGitHub', passport.authenticate('github'), (req, res) => {
    req.session.usuario = req.user
    res.setHeader('Content-Type', 'application/json');
    res.redirect('/perfil')
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