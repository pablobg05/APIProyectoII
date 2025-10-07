module.exports = app => {
    const detalle = require("../controllers/detalle.controller.js");
    const router = require("express").Router();

    // Crear un nuevo Detalle
    router.post("/create", detalle.create);

    // Recuperar todos los Detalles
    router.get("/read", detalle.findDetalles);
    /*
        Filtros opcionales por query params (GET /api/detalle/read?param=value):
        - id_detalle
        - id_venta
        - id_inventario
    */

    // Actualizar un Detalle por id_detalle
    router.put("/update/:id_detalle", detalle.update);

    app.use('/api/detalle', router);
};
