module.exports = (app) => {
    const localidades = require("../controllers/localidad.controller.js");
    var router = require("express").Router();

    // Crear una nueva Localidad
    router.post("/create", localidades.create);

    // Recuperar todas las Localidades
    router.get("/read", localidades.findLocalidades);

    // Actualizar una Localidad por id
    router.put("/update/:id_localidad", localidades.update);

    app.use('/api/localidades', router);
}