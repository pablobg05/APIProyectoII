module.exports = (Sequelize, sequelize) => {
    const Localidad = sequelize.define("localidad", {
        id_localidad: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        nombre: {
            type: Sequelize.STRING,
            allowNull: false
        },
        precio: {
            type: Sequelize.FLOAT,
            allowNull: false
        }
    }, {
        timestamps: false,
        tableName: 'localidades'
    });

    return Localidad;
}