const validator = require('validator');

const validateShip = (data) => {
  let error = '';

  if (!data.carrier) {
    error = 'Invalid input';
  }

  if (!data.trackingNumber) {
    error = 'Invalid input';
  }

  return error;
};

const validateEdit = (data) => {
  let error = '';

  if (!data.status) {
    error = 'Invalid input';
  }

  if (
    data.status !== 'preparing_for_shipment' &&
    data.status !== 'shipped' &&
    data.status !== 'canceled'
  ) {
    error = 'Invalid status';
  }

  if (data.status === 'shipped') {
    if (data.carrier === null || data.carrier === undefined) {
      error = 'Invalid input';
    }

    if (data.trackingNumber === null || data.carrier === undefined) {
      error = 'Invalid input';
    }
  }

  return error;
};

module.exports = {
  validateShip,
  validateEdit
};
