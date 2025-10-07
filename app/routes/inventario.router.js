module.exports = app => {
    const inventario = require("../controllers/inventario.controller.js");
    const router = require("express").Router();

    // Crear un nuevo Inventario
    router.post("/create", inventario.create);

    // Recuperar todos los Inventarios
    router.get("/read", inventario.findInventarios);
    /*
        Filtros opcionales por query params (GET /api/inventario/read?param=value):
        - id_inventario
        - id_partido
        - id_localidad
    */

    // Actualizar un Inventario por id_inventario
    router.put("/update/:id_inventario", inventario.update);

    app.use('/api/inventario', router);
};