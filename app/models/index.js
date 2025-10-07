const dbConfig = require("../config/db.config.js");
const Sequelize = require("sequelize");
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
    host: dbConfig.HOST,
    dialect: dbConfig.dialect,
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false
        }
    },
    pool: {
        max: dbConfig.pool.max,
        min: dbConfig.pool.min,
        acquire: dbConfig.pool.acquire,
        idle: dbConfig.pool.idle,
    }
});
const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.usuario = require("./usuario.model.js")(sequelize, Sequelize);
db.partido = require("./partido.model.js")(sequelize, Sequelize);
db.localidad = require("./localidad.model.js")(sequelize, Sequelize);
db.detalle = require("./detalle.model.js")(sequelize, Sequelize);
db.inventario = require("./inventario.model.js")(sequelize, Sequelize);
db.venta = require("./ventas.model.js")(sequelize, Sequelize);

// Relaciones
db.usuario.hasMany(db.venta, { foreignKey: 'id_usuario' });
db.venta.belongsTo(db.usuario, { foreignKey: 'id_usuario' });
db.venta.hasMany(db.detalle, { foreignKey: 'id_venta' });
db.detalle.belongsTo(db.venta, { foreignKey: 'id_venta' });
db.inventario.hasMany(db.detalle, { foreignKey: 'id_inventario' });
db.detalle.belongsTo(db.inventario, { foreignKey: 'id_inventario' });

module.exports = db;