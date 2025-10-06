const db = require("../models");
const Localidad = db.localidad;
const Sequelize = db.Sequelize;
const Op = Sequelize.Op;

// Crear y guardar una nueva Localidad
exports.create = async (req, res) => {
    // Validar solicitud
    if (!req.body.nombre || !req.body.precio) {
        return res.status(400).send({ message: "Name and price are required." });
    }
    try {
        // Crear una Localidad
        const localidad = {
            nombre: req.body.nombre,
            precio: req.body.precio
        };
        const data = await Localidad.create(localidad);
        res.status(201).send(data);
    } catch (err) {
        res.status(500).send({
            message: err.message || "Some error occurred while creating the Localidad."
        });
    }
}

// Recuperar todas las Localidades de la base de datos.
exports.findLocalidades = async (req, res) => {
    const id = req.query.id_localidad;      // buscar por ID si se pasa
    const nombre = req.query.nombre;   // buscar por nombre si se pasa
    try {
        if (id) {
            // Si hay id, buscamos por PK
            const data = await Localidad.findByPk(id);
            if (data) {
                return res.send(data);
            } else {
                return res.status(404).send({ message: `Cannot find Localidad with id=${id}.` });
            }
        }

        let condition = null;
        if (nombre) {
            condition = { nombre: { [Op.like]: `%${nombre}%` } };
        }
        const data = await Localidad.findAll({ where: condition });
        res.send(data);
    } catch (err) {
        res.status(500).send({
            message: err.message || "Some error occurred while retrieving Localidades."
        });
    }
}

// Actualizar una Localidad por el id en la solicitud
exports.update = async (req, res) => {
    const id = req.params.id_localidad;
    if (!id) return res.status(400).send({ message: 'id_localidad is required.' });

    try {
        const payload = { ...req.body };
        const [updated] = await Localidad.update(payload, {
            where: { id_localidad: id }
        });
        if (updated) {
            const updatedLocalidad = await Localidad.findByPk(id);
            return res.send(updatedLocalidad);
        }
        throw new Error(`Cannot update Localidad with id=${id}. Maybe Localidad was not found or req.body is empty!`);
    } catch (err) {
        res.status(500).send({
            message: err.message || "Some error occurred while updating the Localidad."
        });
    }
};