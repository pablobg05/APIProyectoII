const db = require("../models");
const Venta = db.venta;
const Sequelize = db.Sequelize;
const Op = Sequelize.Op;

// Crear y guardar una nueva Venta
exports.create = async (req, res) => {
    // Validar solicitud
    if (!req.body.id_usuario || req.body.total_venta == null) {
        return res.status(400).send({ message: "id_usuario and total_venta are required." });
    }
    if (req.body.total_venta < 0) {
        return res.status(400).send({ message: "total_venta must be non-negative." });
    }
    try {
        // Crear una Venta
        const venta = {
            id_usuario: req.body.id_usuario,
            total_venta: req.body.total_venta,
            fecha_venta: req.body.fecha_venta || new Date()
        };
        const data = await Venta.create(venta);
        res.status(201).send(data);
    } catch (err) {
        res.status(500).send({
            message: err.message || "Some error occurred while creating the Venta."
        });
    }
}

// Recuperar todas las Ventas de la base de datos.
exports.findVentas = async (req, res) => {
    const id = req.query.id_venta;      // buscar por ID si se pasa
    const id_usuario = req.query.id_usuario;   // buscar por id_usuario si se pasa
    let condition = null;
    try {
        if (id) {
            // Si hay id, buscamos por PK
            const data = await Venta.findByPk(id);
            if (data) {
                return res.send(data);
            } else {
                return res.status(404).send({ message: `Cannot find Venta with id=${id}.` });
            }
        }

        if (id_usuario) {
            condition = { id_usuario: id_usuario };
        }
        const data = await Venta.findAll({ where: condition });
        res.send(data);
    } catch (err) {
        res.status(500).send({
            message: err.message || "Some error occurred while retrieving Ventas."
        });
    }
}

// Actualizar una Venta por id_venta
exports.update = async (req, res) => {
    const id = req.params.id_venta;
    if (!id) return res.status(400).send({ message: 'id_venta is required.' });

    try {
        const payload = { ...req.body };
        // No permitir actualizar id_venta
        if (payload.id_venta) delete payload.id_venta;
        // Validaciones
        if (payload.total_venta != null && payload.total_venta < 0) {
            return res.status(400).send({ message: "total_venta must be non-negative." });
        }
        const result = await Venta.update(payload, {
            where: { id_venta: id }
        });
        const affected = Array.isArray(result) ? result[0] : result;
        if (affected === 1) {
            const updated = await Venta.findByPk(id);
            res.send(updated);
        } else {
            res.status(404).send({ message: `Cannot update Venta with id=${id}. Maybe Venta was not found or req.body is empty!` });
        }
    } catch (err) {
        res.status(500).send({
            message: err.message || "Some error occurred while updating the Venta."
        });
    }
}