module.exports = (app) => {
    const partidos = require("../controllers/partido.controller.js");
    var router = require("express").Router();

    // Crear un nuevo Partido
    router.post("/create", partidos.create);

    // Recuperar todos los Partidos
    router.get("/read", partidos.findPartidos);

    // Actualizar un Partido por id
    router.put("/update/:id_partido", partidos.update);

    app.use('/api/partidos', router);
}