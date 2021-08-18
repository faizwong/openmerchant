const sequelize = require('../sequelize.js');
const dbHelper = require('../helpers/db.js');
const {
  Admin,
  DiscountCode,
  Order,
  Product,
  User
} = require('../models');

dbHelper.connectToDb(sequelize);
dbHelper.deleteAllTables(sequelize);
dbHelper.createAllTables(sequelize);
