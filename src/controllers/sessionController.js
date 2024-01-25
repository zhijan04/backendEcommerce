const passport = require('passport');

class sessionController{
    constructor(){}

    static async loginAuth(req, res, next){
        passport.authenticate('login', (err, user, info) => {
            if (err) {
                return next(err)
            }
            if (!user) {
                return res.redirect('/login?error=Error al iniciar Sesión, verifique los campos e intentelo nuevamente.')
            }
    
            req.session.user = {
                nombre: user.nombre,
                email: user.email,
                rol: user.rol
            }
            res.redirect('/');
        })(req, res, next)
    }
    static async currentUser(req, res){       
    let usuario=req.session.user
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({usuario})
    }
    static async logout(req, res){
        req.session.destroy(error => {
            if (error) {
                res.redirect('/login?error=Fallo al cerrar sesión.');
            }
        });
        res.redirect('/login');
    }
    static async errorGithub(req, res){
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({
        error: "error al autenticar con gitHub"
    });
    }
}

module.exports = sessionController