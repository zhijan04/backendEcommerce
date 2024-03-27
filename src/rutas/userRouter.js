const express = require('express');
const router = express.Router();
const UsuariosController = require('../controllers/usuariosController');

const auth = (req, res, next) => {
    if (!req.session.user && !req.session.usuario) {
        return res.redirect('/login');
    }

    next();
};

router.put('/premium/:uid', UsuariosController.changeUserRole);

router.post('/:uid/documents', UsuariosController.uploadDocuments); // usar key "documento"

router.post('/:uid/productImage', UsuariosController.uploadProductImage); // usar key "productImage"

router.post('/:uid/profile', UsuariosController.uploadProfile); // usar key "profileImage"

module.exports = router;
