    const currentDTO =(usuario)=>{ 
    usuario.email = usuario.email.toUpperCase()
    usuario.rol = usuario.rol.toUpperCase()
    return usuario
}
module.exports = currentDTO
//unicamente puse el rol y email en mayusculas como digo el profe para mostrar que se entiende el concepto.
