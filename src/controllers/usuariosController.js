const UsuariosModel = require('../dao/models/usuariosModel.js');
const multer = require('multer');
const upload = multer({ dest: 'documents/' })
const { profileUpload, productUpload, documentUpload } = require('../middlewares/multer.js')

class UsuariosController {

    static async changeUserRole(req, res) {
        const userId = req.params.uid;
        const user = await UsuariosModel.findOne({ _id: userId });
    
        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
    
        if (user.rol === 'premium') {
            try {
                user.rol = 'user';
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
                logger.error('Error al cambiar el rol del usuario:', error);
                res.status(500).json({ error: 'Error al cambiar el rol del usuario' });
            }
        } else {
            function removeAccents(str) {
                return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            }
            const requiredDocuments = ['Identificación', 'Comprobante de domicilio', 'Comprobante de estado de cuenta'].map(doc => removeAccents(doc));
    
            const userDocuments = user.documents.map(doc => doc.name && removeAccents(doc.name));
            const hasAllRequiredDocuments = requiredDocuments.every(doc => userDocuments.includes(doc));
    
            if (!hasAllRequiredDocuments) {
                return res.status(400).json({ error: 'El usuario debe cargar todos los documentos requeridos antes de actualizar su rol a premium.' });
            }
    
            try {
                user.rol = 'premium';
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
                logger.error('Error al cambiar el rol del usuario:', error);
                res.status(500).json({ error: 'Error al cambiar el rol del usuario' });
            }
        }
    }
    static async uploadDocuments(req, res) {
        const userId = req.params.uid;
    
        documentUpload.single('documento')(req, res, async function (err) {
            if (err) {
                console.error('Error al cargar el archivo:', err);
                return res.status(500).json({ error: 'Error al cargar el archivo.' });
            }
            if (!req.file) {
                console.error('No se proporcionó ningún archivo.');
                return res.status(400).json({ error: 'No se proporcionó ningún archivo.' });
            }
            try {
                const fileName = req.file.originalname;
                const filePath = req.file.path;
                const user = await UsuariosModel.findById(userId);
                
                if (!user) {
                    return res.status(404).json({ error: 'Usuario no encontrado.' });
                }
                user.documents.push({
                    name: fileName,
                    reference: filePath,
                });
                await user.save();
                res.status(200).json({ message: 'Documento subido exitosamente.' });
            } catch (error) {
                console.error('Error al subir el documento:', error);
                res.status(500).json({ error: 'Error interno del servidor.' });
            }
        });
    }
    static async uploadProfile(req, res) {
        try {
            profileUpload.single('profileImage')(req, res, async function (err) {
                if (err) {
                    console.error('Error al cargar el archivo:', err);
                    return res.status(500).json({ error: 'Error interno del servidor.' });
                }
    
                const fileName = req.file.filename;
                res.status(200).json({ message: 'Archivo de perfil cargado exitosamente.', fileName });
            });
        } catch (error) {
            console.error('Error al cargar el archivo de perfil:', error);
            res.status(500).json({ error: 'Error interno del servidor.' });
        }
    }
    
    static async uploadProductImage(req, res) {
        try {
            productUpload.single('productImage')(req, res, async function (err) {
                if (err) {
                    console.error('Error al cargar el archivo:', err);
                    return res.status(500).json({ error: 'Error interno del servidor.' });
                }
    
                const fileName = req.file.filename;
                res.status(200).json({ message: 'Archivo de producto cargado exitosamente.', fileName });
            });
        } catch (error) {
            console.error('Error al cargar el archivo de producto:', error);
            res.status(500).json({ error: 'Error interno del servidor.' });
        }
    }
}

module.exports = UsuariosController;