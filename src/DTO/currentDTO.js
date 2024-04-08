    const currentDTO =(usuario)=>{ 
    usuario.email = usuario.email.toUpperCase()
    usuario.rol = usuario.rol.toUpperCase()
    return usuario
}
module.exports = currentDTO
