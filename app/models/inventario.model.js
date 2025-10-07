module.exports = (sequelize, DataTypes) => {
    const Inventario = sequelize.define('Inventario', {
        id_inventario: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        id_partido: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                // coincidir con tableName en partido.model.js
                model: 'partido',
                key: 'id_partido'
            }
        },
        id_localidad: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                // coincidir con tableName en localidad.model.js
                model: 'localidades',
                key: 'id_localidad'
            }
        },
        cantidad_total: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        cantidad_disponible: {
            type: DataTypes.INTEGER,
            allowNull: true
        }
    }, {
        hooks: {
            beforeValidate: (inventario, options) => {
                if (inventario.cantidad_disponible === undefined || inventario.cantidad_disponible === null) {
                    inventario.cantidad_disponible = inventario.cantidad_total != null ? inventario.cantidad_total : 0;
                }
            }
        },
        tableName: 'Inventarios',
        timestamps: false
    });

    return Inventario;
}