process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;

const server = require('../index.js');
const sequelize = require('../sequelize.js');
const dbHelper = require('../helpers/db.js');
const seedHelper = require('../helpers/seed.js');

chai.use(chaiHttp);

describe('Integration 1', function () {
  this.timeout(0);
  let accessToken = '';

  before(async () => {
    await dbHelper.resetAllTables(sequelize);
    await seedHelper.seed();
  });

  it('auth test', async () => {
    const res = await chai.request(server)
      .get('/api/v1/auth/test');

    expect(res).to.have.status(200);

    expect(res.body).to.eql({
      message: 'auth'
    });
  });

  it('products test', async () => {
    const res = await chai.request(server)
      .get('/api/v1/products/test');

    expect(res).to.have.status(200);

    expect(res.body).to.eql({
      message: 'products'
    });
  });

  it('orders test', async () => {
    const res = await chai.request(server)
      .get('/api/v1/orders/test');

    expect(res).to.have.status(200);

    expect(res.body).to.eql({
      message: 'orders'
    });
  });

  it('admin auth test', async () => {
    const res = await chai.request(server)
      .get('/api/v1/admin/auth/test');

    expect(res).to.have.status(200);

    expect(res.body).to.eql({
      message: 'admin/auth'
    });
  });

  it('admin admins test', async () => {
    const res = await chai.request(server)
      .get('/api/v1/admin/admins/test');

    expect(res).to.have.status(200);

    expect(res.body).to.eql({
      message: 'admin/admins'
    });
  });

  it('admin discount-codes test', async () => {
    const res = await chai.request(server)
      .get('/api/v1/admin/discount-codes/test');

    expect(res).to.have.status(200);

    expect(res.body).to.eql({
      message: 'admin/discount-codes'
    });
  });

  it('admin orders test', async () => {
    const res = await chai.request(server)
      .get('/api/v1/admin/orders/test');

    expect(res).to.have.status(200);

    expect(res.body).to.eql({
      message: 'admin/orders'
    });
  });

  it('admin products test', async () => {
    const res = await chai.request(server)
      .get('/api/v1/admin/products/test');

    expect(res).to.have.status(200);

    expect(res.body).to.eql({
      message: 'admin/products'
    });
  });

  it('admin orders test', async () => {
    const res = await chai.request(server)
      .get('/api/v1/admin/orders/test');

    expect(res).to.have.status(200);

    expect(res.body).to.eql({
      message: 'admin/orders'
    });
  });

  it('GET /products', async () => {
    const res = await chai.request(server)
      .get('/api/v1/products');

    // console.log(res.body.data);

    expect(res).to.have.status(200);
  });

  it('GET /products/:productId', async () => {
    const res = await chai.request(server)
      .get('/api/v1/products/1');

    // console.log(res.body.data);

    expect(res).to.have.status(200);
  });

  it('POST /orders', async () => {
    const res = await chai.request(server)
      .post('/api/v1/orders')
      .send({
        name: 'Faiz Wong',
        email: 'faizwong0907@gmail.com',
        phoneNumber: '+60143658099',
        addressLine1: 'B-06-07, Subang Avenue',
        addressLine2: 'Jalan Kemajuan Subang, SS16',
        city: 'Subang Jaya',
        state: 'Selangor',
        country: 'my',
        postalCode: '47500',
        productId: 1
      });

    // console.log(res.body.data);

    expect(res).to.have.status(200);
  });

  it('POST /orders with discount', async () => {
    const res = await chai.request(server)
      .post('/api/v1/orders')
      .send({
        name: 'Faiz Wong',
        email: 'faizwong0907@gmail.com',
        phoneNumber: '+60143658099',
        addressLine1: 'B-06-07, Subang Avenue',
        addressLine2: 'Jalan Kemajuan Subang, SS16',
        city: 'Subang Jaya',
        state: 'Selangor',
        country: 'my',
        postalCode: '47500',
        productId: 1,
        discountCode: 'CHRISTMAS'
      });

    // console.log(res.body.data);

    expect(res).to.have.status(200);
  });

  it('POST /orders with invalid discount code', async () => {
    const res = await chai.request(server)
      .post('/api/v1/orders')
      .send({
        name: 'Faiz Wong',
        email: 'faizwong0907@gmail.com',
        phoneNumber: '+60143658099',
        addressLine1: 'B-06-07, Subang Avenue',
        addressLine2: 'Jalan Kemajuan Subang, SS16',
        city: 'Subang Jaya',
        state: 'Selangor',
        country: 'my',
        postalCode: '47500',
        productId: 1,
        discountCode: 'INVALID'
      });

    // console.log(res.body.data);
    // console.log(res.body.message);

    expect(res).to.have.status(400);
  });

  it('POST /orders with invalid phone number', async () => {
    const res = await chai.request(server)
      .post('/api/v1/orders')
      .send({
        name: 'Faiz Wong',
        email: 'faizwong0907@gmail.com',
        // phoneNumber: '+8201095419115',
        phoneNumber: '014-365-8099',
        addressLine1: 'B-06-07, Subang Avenue',
        addressLine2: 'Jalan Kemajuan Subang, SS16',
        city: 'Subang Jaya',
        state: 'Selangor',
        country: 'my',
        postalCode: '47500',
        productId: 1
      });

    // console.log(res.body.data);
    // console.log(res.body);

    expect(res).to.have.status(400);
  });
});
