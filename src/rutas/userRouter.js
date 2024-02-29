const express = require('express');
const router = express.Router();
const UsuariosController = require('../controllers/usuariosController');

router.put('/premium/:uid', UsuariosController.changeUserRole);

module.exports = router;
