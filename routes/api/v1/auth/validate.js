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

const validateSignUp = (data) => {
  let error = '';

  if (!data.email) {
    error = 'Invalid input';
  }

  if (!data.password) {
    error = 'Invalid input';
  }

  if (!data.confirmPassword) {
    error = 'Invalid input';
  }

  if (!validator.isEmail(data.email + '')) {
    error = 'Invalid email';
  }

  if (!validator.isLength(data.password + '', {
    min: 8,
    max: 64
  })) {
    error = 'Password too weak. Use a stronger password.';
  }

  if (data.password !== data.confirmPassword) {
    error = 'Passwords do not match';
  }

  return error;
};

const validateChangePassword = (data) => {
  let error = '';

  if (!data.oldPassword) {
    error = 'Invalid input';
  }

  if (!data.newPassword) {
    error = 'Invalid input';
  }

  if (!validator.isLength(data.newPassword + '', {
    min: 8,
    max: 64
  })) {
    error = 'New password too weak. Use a stronger password.';
  }

  return error;
};

const validateForgotPassword = (data) => {
  let error = '';

  if (!data.email) {
    error = 'Invalid input';
  }

  if (!validator.isEmail(data.email + '')) {
    error = 'Invalid email';
  }

  return error;
};

const validateResetPassword = (data) => {
  let error = '';

  if (!data.newPassword) {
    error = 'Invalid input';
  }

  if (!validator.isLength(data.newPassword + '', {
    min: 8,
    max: 64
  })) {
    error = 'New password too weak. Use a stronger password.';
  }

  return error;
};

module.exports = {
  validateSignIn,
  validateSignUp,
  validateChangePassword,
  validateForgotPassword,
  validateResetPassword
};
