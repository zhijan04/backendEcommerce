const express = require('express');
const router = express.Router();
const passport = require('passport');
const sessionController = require ('../controllers/sessionController.js')

router.post('/login', sessionController.loginAuth)

router.get('/current', sessionController.currentUser);

router.post('/registro',
    passport.authenticate('registro', {
        successRedirect: '/login?mensaje=Usuario registrado con éxito.',
        failureRedirect: '/registro?error= Ha ocurrido un error al registrar el usuario, verifique todos los campos.',
        failureFlash: true
    })
);

router.get('/logout', sessionController.logout);

router.get('/github', passport.authenticate('github', {}), (req, res) => {
});

router.get('/callbackGithub', passport.authenticate('github', { failureRedirect: "/api/sessions/errorGitHub" }), (req, res) => {
    req.session.user = req.user
    res.redirect('/productos?message=You logged in correctly');
});

router.get('/errorGitHub', sessionController.errorGithub);

module.exports = {
    routerSession: router
};