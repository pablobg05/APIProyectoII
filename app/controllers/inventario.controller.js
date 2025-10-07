const db = require("../models");
const Inventario = db.inventario;
const Sequelize = db.Sequelize;
const Op = Sequelize.Op;

// Crear y guardar un nuevo Inventario
exports.create = async (req, res) => {
    // Validar solicitud
    if (!req.body.id_partido || !req.body.id_localidad || req.body.cantidad_total == null) {
        return res.status(400).send({ message: "id_partido, id_localidad and cantidad_total are required." });
    }
    if (req.body.cantidad_total < 0) {
        return res.status(400).send({ message: "cantidad_total must be non-negative." });
    }
    if (req.body.cantidad_disponible != null && req.body.cantidad_disponible < 0) {
        return res.status(400).send({ message: "cantidad_disponible must be non-negative." });
    }
    if (req.body.cantidad_disponible != null && req.body.cantidad_disponible > req.body.cantidad_total) {
        return res.status(400).send({ message: "cantidad_disponible cannot exceed cantidad_total." });
    }
    try {
        // Crear un Inventario
        const inventario = {
            id_partido: req.body.id_partido,
            id_localidad: req.body.id_localidad,
            cantidad_total: req.body.cantidad_total,
            cantidad_disponible: req.body.cantidad_disponible != null ? req.body.cantidad_disponible : req.body.cantidad_total
        };
        const data = await Inventario.create(inventario);
        res.status(201).send(data);
    } catch (err) {
        res.status(500).send({
            message: err.message || "Some error occurred while creating the Inventario."
        });
    }
}

// Recuperar todos los Inventarios de la base de datos.
exports.findInventarios = async (req, res) => {
    const id = req.query.id_inventario;      // buscar por ID si se pasa
    const id_partido = req.query.id_partido;   // buscar por id_partido si se pasa
    const id_localidad = req.query.id_localidad; // buscar por id_localidad si se pasa
    let condition = null;

    try {
        if (id) {
            // Si hay id, buscamos por PK
            const data = await Inventario.findByPk(id);
            if (data) {
                return res.send(data);
            } else {
                return res.status(404).send({ message: `Cannot find Inventario with id=${id}.` });
            }
        }

        if (id_partido && id_localidad) {
            condition = { id_partido: id_partido, id_localidad: id_localidad };
        } else if (id_partido) {
            condition = { id_partido: id_partido };
        } else if (id_localidad) {
            condition = { id_localidad: id_localidad };
        }

        const data = await Inventario.findAll({ where: condition });
        res.send(data);
    } catch (err) {
        res.status(500).send({
            message: err.message || "Some error occurred while retrieving inventarios."
        });
    }
}

// Actualizar un Inventario por el id en la solicitud
exports.update = async (req, res) => {
    const id = req.params.id_inventario;
    if (!id) return res.status(400).send({ message: 'id_inventario is required.' });
    try {
        const payload = { ...req.body };
        // Validaciones
        if (payload.cantidad_total != null && payload.cantidad_total < 0) {
            return res.status(400).send({ message: "cantidad_total must be non-negative." });
        }
        if (payload.cantidad_disponible != null && payload.cantidad_disponible < 0) {
            return res.status(400).send({ message: "cantidad_disponible must be non-negative." });
        }
        if (payload.cantidad_total != null && payload.cantidad_disponible != null &&
            payload.cantidad_disponible > payload.cantidad_total) {
            return res.status(400).send({ message: "cantidad_disponible cannot exceed cantidad_total." });
        }
        if (payload.cantidad_total != null && payload.cantidad_disponible == null) {
            // Si se reduce cantidad_total, asegurarse que cantidad_disponible no la exceda
            const existing = await Inventario.findByPk(id);
            if (!existing) {
                return res.status(404).send({ message: `Cannot find Inventario with id=${id}.` });
            }
            if (existing.cantidad_disponible > payload.cantidad_total) {
                return res.status(400).send({ message: "Existing cantidad_disponible exceeds new cantidad_total." });
            }
        }

        const result = await Inventario.update(payload, {
            where: { id_inventario: id }
        });
        const affected = Array.isArray(result) ? result[0] : result;
        if (affected === 1) {
            return res.status(200).send({ message: "Inventario was updated successfully." });
        } else {
            return res.status(404).send({ message: `Cannot update Inventario with id=${id}. Maybe Inventario was not found or req.body is empty!` });
        }
    } catch (err) {
        res.status(500).send({ message: err.message || "Some error occurred while updating the Inventario." });
    }
}