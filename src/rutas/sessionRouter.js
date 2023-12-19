const express = require('express');
const router = express.Router();
const Usuario = require('../dao/models/usuariosModel.js')
const crypto = require('crypto')

router.post('/login', async (req, res) => {
    let { email, password } = req.body;

    if (!email || !password) {
        return res.redirect('/login?error=Complete todos los datos');
    }
    password = crypto.createHmac("sha256", "adminCod3r123").update(password).digest("hex")

    let usuario = await Usuario.findOne({ email: email, password})

    if (!usuario) {
        return res.redirect(`/login?error=Datos incorrectos`);
    }
    req.session.usuario = {
        nombre: usuario.nombre, email: usuario.email, rol: usuario.rol
    }
    res.redirect('/productos')
})

router.post('/registro', async (req, res) => {
    let { nombre, email, password } = req.body;
    if (!nombre || !email || !password) {
        return res.redirect('/registro?error=Complete todos los datos');
    }

    let regEmail = /^(([^<>()\[\]\\.,;:\s@”]+(\.[^<>()\[\]\\.,;:\s@”]+)*)|(“.+”))@((\[[0–9]{1,3}\.[0–9]{1,3}\.[0–9]{1,3}\.[0–9]{1,3}])|(([a-zA-Z\-0–9]+\.)+[a-zA-Z]{2,}))$/
    if (!regEmail.test(email)) {
        return res.redirect('/registro?error=Email con formato incorrecto.')
    }
    let existe = await Usuario.findOne({ email: email })
    if (existe) {
        return res.redirect(`/registro?error=Ya existe un usuario con el email ${email} en la base de datos`)
    }
    let rol = 'user';
    if (email === 'adminCoder@coder.com') {
        rol = 'admin';
    }

    password = crypto.createHmac("sha256", "adminCod3r123").update(password).digest("hex")

    let usuario
    try {
        usuario = await Usuario.create({ nombre, email, password, rol })
        res.redirect(`/login?mensaje=usuario ${email} registrado con éxito.`)
    } catch (error) {
        res.redirect(`/registro?error=error inesperado, reintentelo.`)
    }
});
router.get('/logout', (req, res) => {

    req.session.destroy(error => {
        if (error) {
            res.redirect('/login?error=Fallo al cerrar sesión.')
        }
    })
    res.redirect('/login')
});

module.exports = {
    routerSession: router
} 