const validator = require('validator');

const validateCreate = (data) => {
  let error = '';

  if (!data.UserId) {
    error = 'Invalid input'
  }

  return error;
};

module.exports = {
  validateCreate
};
