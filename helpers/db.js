const connectToDb = async (sequelize) => {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

const disconnectDb = async (sequelize) => {
  try {
    await sequelize.close();
    console.log('Connection has been closed successfully.');
  } catch (error) {
    console.log('Unable to close connection to the database:', error);
  }
};

const syncTables = async (sequelize) => {
  await sequelize.sync({ alter: true });
  // await sequelize.sync();
  console.log('All models were synchronized successfully');
};

const createAllTables = async (sequelize) => {
  await sequelize.sync({ force: true });
  console.log('All models were synchronized successfully');
};

const deleteAllTables = async (sequelize) => {
  await sequelize.drop();
  console.log('All tables dropped');
};

const resetAllTables = async (sequelize) => {
  await sequelize.drop();
  await sequelize.sync({ force: true });
};

module.exports = {
  connectToDb,
  disconnectDb,
  syncTables,
  createAllTables,
  deleteAllTables,
  resetAllTables
};
