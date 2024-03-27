const passport = require('passport');
const currentDTO = require('../DTO/currentDTO.js');
const UsuariosModel = require('../dao/models/usuariosModel.js');

class sessionController{
    constructor(){}
    static middlewareCheckAdmin = (req, res, next) => {
        let usuario=req.session.user
        if (usuario.rol === 'admin' || usuario.rol === 'premium') {
            return next();
        } else {
            res.status(403).json({ error: 'Acceso no autorizado. Se requieren privilegios de administrador o premium.' });
        }
    };
    static async loginAuth(req, res, next) {
        passport.authenticate('login', async (err, user, info) => {
            if (err) {
                return next(err);
            }
            if (!user) {
                return res.redirect('/login?error=Error al iniciar Sesión, verifique los campos e intentelo nuevamente.');
            }

            const fechaHoraArgentina = new Date().toLocaleString('en-US', { timeZone: 'America/Argentina/Buenos_Aires' });

            const fechaHoraLegible = new Date(fechaHoraArgentina).toLocaleString('es-AR', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });

            req.session.user = {
                nombre: user.nombre,
                email: user.email,
                rol: user.rol,
                cartId: user.cartId
            };

            try {
                const updatedUser = await UsuariosModel.findOneAndUpdate(
                    { email: user.email },
                    { $set: { last_connection: fechaHoraLegible } },
                    { new: true }
                );

                if (!updatedUser) {
                    console.error('Usuario no encontrado en la base de datos');
                } else {
                    console.info('Última conexión actualizada para el usuario');
                }
            } catch (error) {
                console.error('Error al actualizar la última conexión del usuario:', error);
            }

            res.redirect('/');
        })(req, res, next);
    }
    
    static async currentUser(req, res){       
    let usuario=req.session.user
    usuario = currentDTO(usuario)
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({usuario})
    }

    static async logout(req, res) {
        if (req.session.user) {
            try {
                const userEmail = req.session.user.email;
                const fechaHoraArgentina = new Date().toLocaleString('en-US', { timeZone: 'America/Argentina/Buenos_Aires' });
                const fechaHoraLegible = new Date(fechaHoraArgentina).toLocaleString('es-AR', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                });
                const user = await UsuariosModel.findOneAndUpdate(
                    { email: userEmail },
                    { $set: { last_connection: fechaHoraLegible } },
                    { new: true }
                );

                if (!user) {
                    console.error('Usuario no encontrado en la base de datos');
                } else {
                    console.log('Última conexión actualizada para el usuario');
                }
            } catch (error) {
                console.error('Error al actualizar la última conexión del usuario:', error);
            }
        }

        req.session.destroy(error => {
            if (error) {
                res.redirect('/login?error=Fallo al cerrar sesión.');
            } else {
                res.redirect('/login');
            }
        });
    }
    static async errorGithub(req, res){
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({
        error: "error al autenticar con gitHub"
    });
    }

}

module.exports = sessionController