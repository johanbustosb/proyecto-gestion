const {Usuario, Rol} = require('../models');
const md5 = require('md5');

function login(req, res) {
    const {email, password} = req.body;

    // Buscamos un usuario en la base de datos que coincida con el
    // email
    Usuario.findOne({where: {email, password: md5(password)}})
    .then(usuario => {
      if (usuario) {
        req.session.usuario = usuario;
        res.redirect("/");
      } else {
        res.render("login", {mensaje: "Usuario o contraseña incorrectos."});
      }
    })
}


function controlAcceso(permiso) {
  return function (req, res, next) {
    const usuario = req.session.usuario

    if (usuario) {
      Usuario.findByPk(usuario.id, {
        include: [Rol]
      })
      .then(usuario => {
        if (usuario && usuario.rol && usuario.rol.permisos && usuario.rol.permisos.indexOf(permiso) != -1) 
          next()
        else
          res.status(403).send("No está autorizado")
      })
    }
    else res.redirect("/login")
  }
}


module.exports = {
    login,
    controlAcceso
}