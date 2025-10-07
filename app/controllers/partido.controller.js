const db = require("../models");
const Partido = db.partido;
const Sequelize = db.Sequelize;
const Op = Sequelize.Op;

// Crear y guardar un nuevo Partido
exports.create = async (req, res) => {
    // Validar solicitud
    if (!req.body.visitante || !req.body.local || !req.body.fecha || !req.body.estadio || !req.body.estado) {
        return res.status(400).send({ message: "All fields are required." });
    }
    try {
        // Crear un Partido
        const partido = {
            visitante: req.body.visitante,
            local: req.body.local,
            fecha: req.body.fecha,
            estadio: req.body.estadio,
            estado: req.body.estado
        };
        const data = await Partido.create(partido);
        res.status(201).send(data);
    } catch (err) {
        res.status(500).send({
            message: err.message || "Some error occurred while creating the Partido."
        });
    }
}

// Recuperar todos los Partidos de la base de datos.
exports.findPartidos = async (req, res) => {
    const id = req.query.id_partido;      // buscar por ID si se pasa
    const visitante = req.query.visitante;   // buscar por visitante si se pasa
    const local = req.query.local;   // buscar por local si se pasa

    try {
        if (id) {
            // Si hay id, buscamos por PK
            const data = await Partido.findByPk(id);
            if (data) {
                return res.send(data);
            } else {
                return res.status(404).send({ message: `Cannot find Partido with id=${id}.` });
            }
        }

        let condition = null;
        if (visitante) {
            condition = { ...condition, visitante: { [Op.like]: `%${visitante}%` } };
        }
        if (local) {
            condition = { ...condition, local: { [Op.like]: `%${local}%` } };
        }
        const data = await Partido.findAll({ where: condition });
        res.send(data);
    } catch (err) {
        res.status(500).send({
            message: err.message || "Some error occurred while retrieving partidos."
        });
    }
}

// Actualizar un Partido por el id en la solicitud
exports.update = async (req, res) => {
    const id = req.params.id_partido;
    if (!id) return res.status(400).send({ message: 'id_partido is required.' });

    try {
        const payload = { ...req.body };
        const result = await Partido.update(payload, {
            where: { id_partido: id }
        });
        if (result[0] === 1) {
            res.send({ message: "Partido was updated successfully." });
        } else {
            res.status(404).send({ message: `Cannot update Partido with id=${id}. Maybe Partido was not found or req.body is empty!` });
        }
    } catch (err) {
        res.status(500).send({
            message: err.message || "Some error occurred while updating the Partido."
        });
    }
};