module.exports = app => {
    const usuarios = require("../controllers/usuario.controller.js");
    const router = require("express").Router();

    // Create a new Usuario
    router.post("/create", usuarios.create);

    // Retrieve Usuarios (all or by filters) [los filtros se ponen con ?, por ejemplo ?id_usuario=3 o ?nombre=Juan, y no hay que usar comillas]
    router.get("/read", usuarios.findUsuarios);

    // Update a Usuario with id
    router.put("/update/:id_usuario", usuarios.update);

    //soft delete a Usuario with id
    router.put("/delete/:id_usuario", usuarios.softDelete);

    //Login
    router.post("/login", usuarios.login);

    app.use('/api/usuarios', router);
}