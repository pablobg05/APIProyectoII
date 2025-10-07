module.exports = app => {
    const ventas = require("../controllers/ventas.controller.js");
    const router = require("express").Router();

    // Crear una nueva Venta
    router.post("/create", ventas.create);

    // Recuperar todas las Ventas
    router.get("/read", ventas.findVentas);
    /*
        Filtros opcionales por query params (GET /api/ventas/read?param=value):
        - id_venta
        - id_usuario
    */

    // Actualizar una Venta por id_venta
    router.put("/update/:id_venta", ventas.update);

    app.use('/api/ventas', router);
}