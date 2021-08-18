const { DataTypes } = require('sequelize');

const orderAttributes = {
  // Customer
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: true
    }
  },
  phoneNumber: {
    type: DataTypes.STRING,
    allowNull: false
  },
  // Shipping
  addressLine1: {
    type: DataTypes.STRING,
    allowNull: false
  },
  addressLine2: {
    type: DataTypes.STRING,
  },
  city: {
    type: DataTypes.STRING,
    allowNull: false
  },
  state: {
    type: DataTypes.STRING,
    allowNull: false
  },
  postalCode: {
    type: DataTypes.STRING,
    allowNull: false
  },
  country: {
    type: DataTypes.STRING,
    allowNull: false
  },
  carrier: {
    type: DataTypes.STRING
  },
  trackingNumber: {
    type: DataTypes.STRING
  },
  // Product
  productName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  subtotal: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  discount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false
  },
  total: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  discountCode: {
    type: DataTypes.STRING
  },
  discountPercentage: {
    type: DataTypes.INTEGER
  },
  // Payment
  stripePaymentIntentId: {
    type: DataTypes.STRING,
    unique: true
  },
  // Status
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'awaiting_payment'
  },
  orderPlacedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: Date.now()
  },
  paymentCompletedAt: {
    type: DataTypes.DATE
  },
  shippedAt: {
    type: DataTypes.DATE
  },
  canceledAt: {
    type: DataTypes.DATE
  }
};

const orderOptions = {
  tableName: 'Orders'
};

module.exports = {
  orderAttributes,
  orderOptions
};
