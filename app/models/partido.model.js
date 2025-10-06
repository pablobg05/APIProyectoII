module.exports = (sequelize, Sequelize) => {
    const Partido = sequelize.define("partido", {
        id_partido: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        visitante: {
            type: Sequelize.STRING,
            allowNull: false
        },
        local: {
            type: Sequelize.STRING,
            allowNull: false
        },
        fecha: {
            type: Sequelize.DATE,
            allowNull: false
        },
        estadio: {
            type: Sequelize.STRING,
            allowNull: false
        },
        estado: {
            type: Sequelize.STRING,
            allowNull: false
        }
    }, {
        timestamps: false,
        tableName: 'partido'
    });
    return Partido;
}