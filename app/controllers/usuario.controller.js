const db = require("../models");
const Usuario = db.usuario;
const Sequelize = db.Sequelize;
const Op = Sequelize.Op;
const bcrypt = require('bcrypt');

// Crear y guardar un nuevo Usuario
exports.create = async (req, res) => {
    // Validar solicitud
    if (!req.body.username || !req.body.password || !req.body.nombre) {
        return res.status(400).send({ message: "username, password and name are required." });
    }

    try {
        // Crear un Usuario (el hashing se realiza en el setter del modelo)
        const usuario = {
            username: req.body.username,
            password: req.body.password,
            nombre: req.body.nombre,
            rol: req.body.rol || 'user'  // valor por defecto 'user'
        };

        const data = await Usuario.create(usuario);
        // no devolver password
        const safe = data.get ? data.get({ plain: true }) : data;
        if (safe.password) delete safe.password;
        res.status(201).send(safe);
    } catch (err) {
        res.status(500).send({
            message: err.message || "Some error occurred while creating the Usuario."
        });
    }
}

// Recuperar todos los Usuarios de la base de datos.
exports.findUsuarios = async (req, res) => {
    const id = req.query.id_usuario;      // buscar por ID si se pasa
    const username = req.query.username;   // buscar por username si se pasa

    try {
        if (id) {
            // Si hay id, buscamos por PK y excluimos password
            const data = await Usuario.findByPk(id, { attributes: { exclude: ['password'] } });
            if (data) {
                return res.send(data);
            } else {
                return res.status(404).send({ message: `Cannot find Usuario with id=${id}.` });
            }
        }

        let condition = null;
        if (username) {
            condition = { username: { [Op.like]: `%${username}%` } };
        }

        const data = await Usuario.findAll({ where: condition, attributes: { exclude: ['password'] } });
        res.send(data);
    } catch (err) {
        res.status(500).send({
            message: err.message || "Some error occurred while retrieving usuarios."
        });
    }
};

// Actualizar un Usuario identificado por el id en la solicitud
exports.update = async (req, res) => {
    const id = req.params.id_usuario;
    if (!id) return res.status(400).send({ message: 'id_usuario is required.' });

    try {
        const payload = { ...req.body };
        // Si se envía password, usar instance.save() para que el setter del modelo aplique el hash
        if (payload.password) {
            const userInstance = await Usuario.findByPk(id);
            if (!userInstance) return res.status(404).send({ message: `Cannot find Usuario with id=${id}.` });
            userInstance.set('password', payload.password);
            // set other fields
            Object.keys(payload).forEach(key => {
                if (key !== 'password') userInstance.set(key, payload[key]);
            });
            await userInstance.save();
            return res.status(200).send({ message: "Usuario was updated successfully." });
        }

        const result = await Usuario.update(payload, {
            where: { id_usuario: id }
        });

        const affected = Array.isArray(result) ? result[0] : result;
        if (affected === 1) {
            return res.status(200).send({ message: "Usuario was updated successfully." });
        } else {
            return res.status(404).send({ message: `Cannot update Usuario with id=${id}. Maybe Usuario was not found or req.body is empty!` });
        }
    } catch (err) {
        res.status(500).send({ message: err.message || "Some error occurred while updating the Usuario." });
    }
};

// soft delete
exports.softDelete = async (req, res) => {
    const id = req.params.id_usuario;
    if (!id) return res.status(400).send({ message: 'id_usuario is required.' });

    try {
        // Solo marcar como false si actualmente está en true (evitar sobrescribir)
        const result = await Usuario.update({ estado: false }, {
            where: { id_usuario: id, estado: true }
        });

        const affected = Array.isArray(result) ? result[0] : result;
        if (affected === 1) {
            return res.status(200).send({ message: "Usuario was soft deleted successfully." });
        } else {
            return res.status(404).send({ message: `Cannot soft delete Usuario with id=${id}. Maybe Usuario was not found or was already deleted.` });
        }
    } catch (err) {
        res.status(500).send({ message: err.message || "Some error occurred while soft deleting the Usuario." });
    }
};

//Login
exports.login = async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).send({ message: "Username and password are required." });
    }

    try {
        const user = await Usuario.findOne({ where: { username } });
        if (!user) return res.status(404).send({ message: "User not found." });

        // Si tienes soft-delete, evita logins de usuarios inactivos
        if (user.estado === false) return res.status(403).send({ message: 'User is inactive.' });

        const isPasswordValid = bcrypt.compareSync(password, user.password);
        if (!isPasswordValid) return res.status(401).send({ message: "Invalid password." });

        // Autenticación exitosa: no devolver password
        const safeUser = user.get ? user.get({ plain: true }) : { ...user };
        if (safeUser.password) delete safeUser.password;
        res.send({ message: "Login successful.", user: safeUser });
    } catch (err) {
        res.status(500).send({ message: err.message || "Some error occurred during login." });
    }
};