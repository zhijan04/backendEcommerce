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
        Token: String,
        expira: Date,
        cartId: String,
        documents: [
            {
                name: String,
                reference: String
            }
        ],
        last_connection: String,
    },
        {
        timestamps: {
            updatedAt: "FechaUltMod", 
            createdAt: "FechaAlta"
        }
    },{strict:false}
);

usuariosEsquema.pre('save', function(next) {
    this.last_connection = new Date();
    next();
});

const Usuario = mongoose.model("usuarios", usuariosEsquema);

module.exports = Usuario;
