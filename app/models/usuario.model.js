module.exports = (sequelize, DataTypes) => {
    const Usuario = sequelize.define("usuario", {
        id_usuario: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: [8, 72]
            },
            set(value) {
                if(value){
                    const bcrypt = require('bcrypt');
                    const salt = bcrypt.genSaltSync(10);
                    const hash = bcrypt.hashSync(value, salt);
                    this.setDataValue('password', hash);
                }
            }
        },
        nombre: {
            type: DataTypes.STRING,
            allowNull: false
        },
        rol: {
            type: DataTypes.ENUM,
            values: ['admin', 'user'],
            defaultValue: 'user'
        },
        estado: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        }
    }, {
        timestamps: true,
        tableName: "usuarios"
    });

    return Usuario;
}