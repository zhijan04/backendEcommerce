const mongoose = require('mongoose');

const usuariosEsquema = new mongoose.Schema(
    { 
        first_name: String,
        last_name: String,
        email: {
            type: String, 
            unique: true
        },
        age: Number,
        password: String,
        rol: {
            type: String,
            default: 'user'
        },
        cartId: String
    },
    {
        timestamps: {
            updatedAt: "FechaUltMod", 
            createdAt: "FechaAlta"
        }
    },{strict:false}
);

const Usuario = mongoose.model("usuarios", usuariosEsquema);

module.exports = Usuario;
