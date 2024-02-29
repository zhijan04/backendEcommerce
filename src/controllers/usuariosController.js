const UsuariosModel = require('../dao/models/usuariosModel.js');

class UsuariosController {

    static async changeUserRole(req, res) {
        const userId = req.params.uid;
        const user = await UsuariosModel.findOne({ _id: userId });

        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        try {
            user.rol = user.rol === 'user' ? 'premium' : 'user';
            await user.save();

            res.status(200).json({
                message: 'Rol de usuario actualizado correctamente',
                user: {
                    _id: user._id,
                    nombre: user.nombre,
                    email: user.email,
                    rol: user.rol,
                },
            });
        } catch (error) {
            logger.error('Error al cambiar el rol del usuario:');
            res.status(500).json({ error: 'Error al cambiar el rol del usuario' });
        }
    }
}

module.exports = UsuariosController;