const { DataTypes } = require('sequelize');

const galleryImageAttributes = {
  imageFileName: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'gallery-images/default.jpg'
  }
};

const galleryImageOptions = {
  tableName: 'GalleryImages'
};

module.exports = {
  galleryImageAttributes,
  galleryImageOptions
};
