const { DataTypes } = require('sequelize');

const productAttributes = {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  shortDescription: {
    type: DataTypes.TEXT
  },
  longDescription: {
    type: DataTypes.TEXT
  },
  regularPrice: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      isDecimal: true,
    }
  },
  salePrice: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      isDecimal: true,
    }
  },
  imageFileName: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'product-images/default.jpg'
  },
  isAvailable: {
    type: DataTypes.BOOLEAN,
    allowNull: false
  },
  isPublic: {
    type: DataTypes.BOOLEAN,
    allowNull: false
  }
};

const productOptions = {
  tableName: 'Products'
};

module.exports = {
  productAttributes,
  productOptions
};
