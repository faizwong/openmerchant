const { DataTypes } = require('sequelize');

const discountCodeAttributes = {
  code: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  discountPercentage: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      isDecimal: true,
      min: 0,
      max: 100
    }
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false
  }
};

const discountCodeOptions = {
  tableName: 'DiscountCodes'
};

module.exports = {
  discountCodeAttributes,
  discountCodeOptions
};
