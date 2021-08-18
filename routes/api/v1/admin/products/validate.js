const validator = require('validator');

const validateCreate = (data) => {
  let error = '';

  if (!data.name) {
    error = 'Invalid input';
  }

  if (!data.regularPrice) {
    error = 'Invalid input';
  }

  if (!data.salePrice) {
    error = 'Invalid input';
  }

  if (typeof data.isAvailable === 'undefined') {
    error = 'Invalid input';
  }

  if (typeof data.isPublic === 'undefined') {
    error = 'Invalid input';
  }

  if (!validator.isDecimal(data.regularPrice + '')) {
    error = 'Invalid regularPrice'
  }

  if (!validator.isDecimal(data.salePrice + '')) {
    error = 'Invalid salePrice'
  }

  return error;
};

const validateUploadImage = (req) => {
  let error = '';

  if (!req.file) {
    error = 'Invalid input';
    return error;
  }

  if (req.file.mimetype !== 'image/jpeg' && req.file.mimetype !== 'image/png') {
    error = 'Image must be JPEG or PNG';
  }

  if (req.file.size > 10000000) {
    error = 'Image must be smaller than 10MB';
  }

  return error;
}

module.exports = {
  validateCreate,
  validateUploadImage
};
