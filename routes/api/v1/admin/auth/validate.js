const validator = require('validator');

const validateSignIn = (data) => {
  let error = '';

  if (!data.email) {
    error = 'Invalid email or password';
  }

  if (!data.password) {
    error = 'Invalid email or password';
  }

  if (!validator.isEmail(data.email + '')) {
    error = 'Invalid email or password';
  }

  return error;
};

module.exports = {
  validateSignIn
};
