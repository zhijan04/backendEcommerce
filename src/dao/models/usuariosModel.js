const mongoose = require('mongoose');

const usuariosEsquema = new mongoose.Schema(
    {
        nombre: String,
        email: {
            type: String, 
            unique: true
        },
        password: String,
        rol: {
            type: String,
            default: 'user'
        }
    },
    {
        timestamps: {
            updatedAt: "FechaUltMod", 
            createdAt: "FechaAlta"
        }
    }
);

const Usuario = mongoose.model("usuarios", usuariosEsquema);

module.exports = Usuario;
