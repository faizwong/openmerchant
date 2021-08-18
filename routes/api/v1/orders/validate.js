const validator = require('validator');

const validatePlaceOrder = (data) => {
  let error = '';

  if (!data.name) {
    error = 'Invalid input';
  }

  if (!data.email) {
    error = 'Invalid input';
  }

  if (!data.phoneNumber) {
    error = 'Invalid input';
  }

  if (!data.addressLine1) {
    error = 'Invalid input';
  }

  if (!data.addressLine2) {
    error = 'Invalid input';
  }

  if (!data.city) {
    error = 'Invalid input';
  }

  if (!data.state) {
    error = 'Invalid input';
  }

  if (!data.postalCode) {
    error = 'Invalid input';
  }

  if (!data.country) {
    error = 'Invalid input';
  }

  if (!data.productId) {
    error = 'Invalid input';
  }

  if (!validator.isEmail(data.email + '')) {
    error = 'Invalid email';
  }

  if (!validator.isMobilePhone(data.phoneNumber + '', ['ms-MY'])) {
    error = 'Invalid phone number';
  }

  return error;
}

module.exports = {
  validatePlaceOrder
};
