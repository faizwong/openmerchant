const sequelize = require('../sequelize.js');

const { adminAttributes, adminOptions } = require('./Admin');
const { discountCodeAttributes, discountCodeOptions } = require('./DiscountCode');
const { galleryImageAttributes, galleryImageOptions } = require('./GalleryImage');
const { orderAttributes, orderOptions } = require('./Order');
const { productAttributes, productOptions } = require('./Product');
const { userAttributes, userOptions } = require('./User');

const Admin = sequelize.define('Admin', adminAttributes, adminOptions);
const DiscountCode = sequelize.define('DiscountCode', discountCodeAttributes, discountCodeOptions);
const GalleryImage = sequelize.define('GalleryImage', galleryImageAttributes, galleryImageOptions);
const Order = sequelize.define('Order', orderAttributes, orderOptions);
const Product = sequelize.define('Product', productAttributes, productOptions);
const User = sequelize.define('User', userAttributes, userOptions);

User.hasMany(Admin);
Admin.belongsTo(User);

Product.hasMany(GalleryImage, {
  onDelete: 'CASCADE'
});
GalleryImage.belongsTo(Product);

module.exports = {
  Admin,
  DiscountCode,
  GalleryImage,
  Order,
  Product,
  User
};
