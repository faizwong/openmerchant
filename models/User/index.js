const { DataTypes } = require('sequelize');

const userAttributes = {
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  passwordHash: {
    type: DataTypes.STRING,
    allowNull: false
  }
};

const userOptions = {
  tableName: 'Users'
};

module.exports = {
  userAttributes,
  userOptions
};
