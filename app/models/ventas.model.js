module.exports = (sequelize, DataTypes) => {
    const Ventas = sequelize.define('Ventas', {
        id_venta: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        id_usuario: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                // debe coincidir con el tableName definido en usuario.model.js
                model: 'usuarios',
                key: 'id_usuario'
            }
        },
        total_venta: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        fecha_venta: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        }
    }, {
        tableName: 'Ventas',
        timestamps: false
    });

    return Ventas;
}