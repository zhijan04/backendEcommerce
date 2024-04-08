const express = require('express');
const router = express.Router();
const UsuariosController = require('../controllers/usuariosController');

const auth = (req, res, next) => {
    if (!req.session.user && !req.session.usuario) {
        return res.redirect('/login');
    }

    next();
};

router.put('/premium/:uid',auth, UsuariosController.changeUserRole);

router.post('/:uid/documents',auth, UsuariosController.uploadDocuments); 

router.post('/:uid/productImage',auth, UsuariosController.uploadProductImage);

router.post('/:uid/profile',auth, UsuariosController.uploadProfile);

module.exports = router;
