const db = require("../models");
const Detalle = db.detalle;
const Inventario = db.inventario;
const Venta = db.venta;
const Sequelize = db.Sequelize;
const Op = Sequelize.Op;

// Crear y guardar un nuevo Detalle
exports.create = async (req, res) => {
    // Validar solicitud
    if (!req.body.id_venta || !req.body.id_inventario || req.body.cantidad == null || req.body.precio_unitario == null) {
        return res.status(400).send({ message: "id_venta, id_inventario, cantidad and precio_unitario are required." });
    }
    if (req.body.cantidad <= 0) {
        return res.status(400).send({ message: "cantidad must be greater than zero." });
    }
    if (req.body.precio_unitario < 0) {
        return res.status(400).send({ message: "precio_unitario must be non-negative." });
    }
    try {
        // Validar existencia de Venta e Inventario
        const venta = await Venta.findByPk(req.body.id_venta);
        if (!venta) return res.status(404).send({ message: `Cannot find Venta with id=${req.body.id_venta}.` });

        const inventario = await Inventario.findByPk(req.body.id_inventario);
        if (!inventario) return res.status(404).send({ message: `Cannot find Inventario with id=${req.body.id_inventario}.` });

        // Verificar stock disponible
        if (inventario.cantidad_disponible < req.body.cantidad) {
            return res.status(400).send({ message: `Not enough stock in inventario id=${req.body.id_inventario}. Available: ${inventario.cantidad_disponible}` });
        }

        // Derivar partido/localidad desde inventario
        const id_partido = inventario.id_partido;
        const id_localidad = inventario.id_localidad;

        // Usar transacción para crear detalle y decrementar inventario
        const t = await db.sequelize.transaction();
        try {
            const detalle = {
                id_venta: req.body.id_venta,
                id_inventario: req.body.id_inventario,
                id_partido: id_partido,
                id_localidad: id_localidad,
                cantidad: req.body.cantidad,
                precio_unitario: req.body.precio_unitario
            };

            const data = await Detalle.create(detalle, { transaction: t });

            // Reducir cantidad_disponible
            await inventario.decrement('cantidad_disponible', { by: req.body.cantidad, transaction: t });

            await t.commit();
            res.status(201).send(data);
        } catch (errTx) {
            await t.rollback();
            throw errTx;
        }
    } catch (err) {
        res.status(500).send({
            message: err.message || "Some error occurred while creating the Detalle."
        });
    }
}

// Recuperar todos los Detalles de la base de datos.
exports.findDetalles = async (req, res) => {
    const id = req.query.id_detalle;      // buscar por ID si se pasa
    const id_venta = req.query.id_venta;   // buscar por id_venta si se pasa
    const id_inventario = req.query.id_inventario; // buscar por id_inventario si se pasa
    let condition = null;

    try {
        if (id) {
            // Si hay id, buscamos por PK
            const data = await Detalle.findByPk(id);
            if (data) {
                return res.send(data);
            } else {
                return res.status(404).send({ message: `Cannot find Detalle with id=${id}.` });
            }
        }
        if (id_venta && id_inventario) {
            condition = { id_venta: id_venta, id_inventario: id_inventario };
        } else if (id_venta) {
            condition = { id_venta: id_venta };
        } else if (id_inventario) {
            condition = { id_inventario: id_inventario };
        }
        const data = await Detalle.findAll({ where: condition });
        res.send(data);
    } catch (err) {
        res.status(500).send({
            message: err.message || "Some error occurred while retrieving Detalles."
        });
    }
}

// Actualizar un Detalle por id_detalle
exports.update = async (req, res) => {
    const id = req.params.id_detalle;
    if (!id) return res.status(400).send({ message: 'id_detalle is required.' });
    try {
        const payload = { ...req.body };
        // Validaciones
        if (payload.cantidad != null && payload.cantidad <= 0) {
            return res.status(400).send({ message: "cantidad must be greater than zero." });
        }
        if (payload.precio_unitario != null && payload.precio_unitario < 0) {
            return res.status(400).send({ message: "precio_unitario must be non-negative." });
        }

        // No permitir actualizar id_detalle
        if (payload.id_detalle) delete payload.id_detalle;

        // Si cambia la cantidad, necesitamos ajustar el inventario asociado
        const existing = await Detalle.findByPk(id);
        if (!existing) return res.status(404).send({ message: `Cannot find Detalle with id=${id}.` });

        if (payload.cantidad != null && payload.cantidad !== existing.cantidad) {
            const inventario = await Inventario.findByPk(existing.id_inventario);
            if (!inventario) return res.status(404).send({ message: `Cannot find Inventario with id=${existing.id_inventario}.` });

            const delta = payload.cantidad - existing.cantidad; // positive => need more stock
            if (delta > 0 && inventario.cantidad_disponible < delta) {
                return res.status(400).send({ message: `Not enough stock to increase cantidad by ${delta}. Available: ${inventario.cantidad_disponible}` });
            }

            // Transacción para actualizar detalle y ajustar inventario
            const t = await db.sequelize.transaction();
            try {
                const [resUpdate] = await Detalle.update(payload, { where: { id_detalle: id }, transaction: t });
                if (resUpdate !== 1) {
                    await t.rollback();
                    return res.status(404).send({ message: `Cannot update Detalle with id=${id}.` });
                }

                if (delta > 0) {
                    await inventario.decrement('cantidad_disponible', { by: delta, transaction: t });
                } else if (delta < 0) {
                    await inventario.increment('cantidad_disponible', { by: -delta, transaction: t });
                }

                await t.commit();
                const updated = await Detalle.findByPk(id);
                return res.send(updated);
            } catch (errTx) {
                await t.rollback();
                throw errTx;
            }
        }

        // Si no hay cambio de cantidad, actualización simple
        const result = await Detalle.update(payload, { where: { id_detalle: id } });
        const affected = Array.isArray(result) ? result[0] : result;
        if (affected === 1) {
            const updated = await Detalle.findByPk(id);
            return res.send(updated);
        } else {
            return res.status(404).send({ message: `Cannot update Detalle with id=${id}. Maybe Detalle was not found or req.body is empty!` });
        }
    } catch (err) {
        res.status(500).send({
            message: err.message || "Some error occurred while updating the Detalle."
        });
    }
}