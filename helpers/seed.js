const bcrypt = require('bcryptjs');

const {
  Admin,
  DiscountCode,
  Order,
  Product,
  User
} = require('../models');

const seedUsers = [
  {
    email: 'faizwong0907@gmail.com',
    password: 'oniichan'
  }
];

const seedAdmins = [
  {
    UserId: 1
  }
];

const seedDiscountCodes = [
  {
    code: 'CHRISTMAS',
    discountPercentage: 10,
    isActive: true
  }
];

const seedProducts = [
  {
    name: 'product1',
    shortDescription: 'product1 short description',
    longDescription: 'product1 long description',
    regularPrice: 1000,
    salePrice: 800,
    isAvailable: true,
    isPublic: true
  },
  {
    name: 'product2',
    shortDescription: 'product2 short description',
    longDescription: 'product2 long description',
    regularPrice: 2000,
    salePrice: 2000,
    isAvailable: true,
    isPublic: true
  }
];

const seedOrders = [];

const seed = async () => {
  try {
    const transformedSeedUsers = [];
    for (let i = 0; i < seedUsers.length; i++) {
      const salt = await bcrypt.genSalt(10);
      const currentHashedPassword = await bcrypt.hash(seedUsers[i].password, salt);
      transformedSeedUsers.push({
        email: seedUsers[i].email,
        passwordHash: currentHashedPassword,
      });
    }

    await User.bulkCreate(transformedSeedUsers, { validate: true });
    await Admin.bulkCreate(seedAdmins, { validate: true });
    await DiscountCode.bulkCreate(seedDiscountCodes, { validate: true });
    await Product.bulkCreate(seedProducts, { validate: true });
    await Order.bulkCreate(seedOrders, { validate: true });
  } catch (error) {
    console.log('Database seed failed');
    console.log(error);
  }
};

module.exports = { seed };
