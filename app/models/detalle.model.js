module.exports = (sequelize, DataTypes) => {
    const Detalle = sequelize.define('Detalle', {
        id_detalle: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        id_venta: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Ventas',
                key: 'id_venta'
            }
        },
        id_localidad: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'localidades',
                key: 'id_localidad'
            }
        },
        id_inventario: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Inventarios',
                key: 'id_inventario'
            }
        },
        id_partido: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'partido',
                key: 'id_partido'
            }
        },
        cantidad: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        precio_unitario: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        }
    }, {
        tableName: 'Detalles',
        timestamps: false
    });

    return Detalle;
}