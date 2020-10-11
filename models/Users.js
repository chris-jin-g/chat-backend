var Sequelize = require('sequelize');
const { Op, DataTypes } = Sequelize;
var sequelize = new Sequelize('rishtay_rishtapk_rishtapa_dbase1', 'root', '', {
    host: 'localhost',
    dialect: 'mssql',
    operatorsAliases: false,

    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
  });

  const DISABLE_SEQUELIZE_DEFAULTS = {
    timestamps: false,
    freezeTableName: true,
  };

const Users = sequelize.define('new_database_dagger', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    Prefix: { type: DataTypes.STRING },
    ConfirmEmail: { type: DataTypes.STRING },
    Name: { type: DataTypes.STRING },
    Lastname: { type: DataTypes.STRING },
    Gender: { type: DataTypes.STRING },
    Avatar: { type: DataTypes.STRING },
    Active: { type: DataTypes.INTEGER },
    Country: { type: DataTypes.STRING },
    Age: { type: DataTypes.INTEGER },
    BlockList: { type: DataTypes.STRING}
}, DISABLE_SEQUELIZE_DEFAULTS);

module.exports = Users;