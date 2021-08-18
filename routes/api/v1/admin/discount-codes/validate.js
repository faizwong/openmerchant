const validator = require('validator');

const validateCreate = (data) => {
  let error = '';

  if (!data.code) {
    error = 'Invalid input';
  }

  if (!data.discountPercentage) {
    error = 'Invalid input';
  }

  if (typeof data.isActive === 'undefined') {
    error = 'Invalid input';
  }

  if (!validator.isDecimal(data.discountPercentage + '')) {
    error = 'Invalid discountPercentage'
  }

  return error;
};

module.exports = {
  validateCreate
};
