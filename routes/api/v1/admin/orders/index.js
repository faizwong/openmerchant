const router = require('express').Router();
const expressJson = require('express').json();

const authenticateJWT = require('../../../../../middlewares/authenticateJWT');
const { validateShip, validateEdit } = require('./validate.js');
const {
  Admin,
  Order
} = require('../../../../../models');

router.get('/test', (req, res) => {
  return res.json({ message: 'admin/orders' });
});

router.get('/', authenticateJWT, async (req, res) => {
  try {
    const admin = await Admin.findOne({
      where: { UserId: req.userId }
    });

    if (!admin) {
      return res.status(403).json({ message: 'User not admin' });
    }

    const itemsPerPage = 25;
    let totalItems;
    let totalPages;
    let currentPage;
    let offset = 0;
    let currentPageSize;
    
    let page = 1;
    if (req.query && Object.keys(req.query).length !== 0 && req.query.constructor === Object) {
      if (req.query.page) {
        page = parseInt(req.query.page, 10);
      } else {
        return res.status(420).json({ message: 'Bad input' });
      }
    }
    offset = parseInt(page, 10) * itemsPerPage - itemsPerPage;

    const { count, rows } = await Order.findAndCountAll({
      limit: itemsPerPage,
      offset: offset,
      order: [
        ['updatedAt', 'DESC']
      ]
    });

    totalItems = count;
    totalPages = Math.ceil(count / itemsPerPage);
    currentPage = page;
    currentPageSize = rows.length;

    const dataPayload = {
      orders: rows,
      pagination: {
        totalItems: totalItems,
        totalPages: totalPages,
        currentPage: currentPage,
        currentPageSize: currentPageSize
      }
    };

    return res.json({
      message: 'success',
      data: dataPayload
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something went wrong' });
  }
});

router.get('/to-ship', authenticateJWT, async (req, res) => {
  try {
    const admin = await Admin.findOne({
      where: { UserId: req.userId }
    });

    if (!admin) {
      return res.status(403).json({ message: 'User not admin' });
    }

    const itemsPerPage = 25;
    let totalItems;
    let totalPages;
    let currentPage;
    let offset = 0;
    let currentPageSize;
    
    let page = 1;
    if (req.query && Object.keys(req.query).length !== 0 && req.query.constructor === Object) {
      if (req.query.page) {
        page = parseInt(req.query.page, 10);
      } else {
        return res.status(420).json({ message: 'Bad input' });
      }
    }
    offset = parseInt(page, 10) * itemsPerPage - itemsPerPage;

    const { count, rows } = await Order.findAndCountAll({
      where: { status: 'preparing_for_shipment' },
      limit: itemsPerPage,
      offset: offset,
      order: [
        ['updatedAt', 'DESC']
      ]
    });

    totalItems = count;
    totalPages = Math.ceil(count / itemsPerPage);
    currentPage = page;
    currentPageSize = rows.length;

    const dataPayload = {
      orders: rows,
      pagination: {
        totalItems: totalItems,
        totalPages: totalPages,
        currentPage: currentPage,
        currentPageSize: currentPageSize
      }
    };

    return res.json({
      message: 'success',
      data: dataPayload
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something went wrong' });
  }
});

router.get('/shipped', authenticateJWT, async (req, res) => {
  try {
    const admin = await Admin.findOne({
      where: { UserId: req.userId }
    });

    if (!admin) {
      return res.status(403).json({ message: 'User not admin' });
    }

    const itemsPerPage = 25;
    let totalItems;
    let totalPages;
    let currentPage;
    let offset = 0;
    let currentPageSize;
    
    let page = 1;
    if (req.query && Object.keys(req.query).length !== 0 && req.query.constructor === Object) {
      if (req.query.page) {
        page = parseInt(req.query.page, 10);
      } else {
        return res.status(420).json({ message: 'Bad input' });
      }
    }
    offset = parseInt(page, 10) * itemsPerPage - itemsPerPage;

    const { count, rows } = await Order.findAndCountAll({
      where: { status: 'shipped' },
      limit: itemsPerPage,
      offset: offset,
      order: [
        ['updatedAt', 'DESC']
      ]
    });

    totalItems = count;
    totalPages = Math.ceil(count / itemsPerPage);
    currentPage = page;
    currentPageSize = rows.length;

    const dataPayload = {
      orders: rows,
      pagination: {
        totalItems: totalItems,
        totalPages: totalPages,
        currentPage: currentPage,
        currentPageSize: currentPageSize
      }
    };

    return res.json({
      message: 'success',
      data: dataPayload
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something went wrong' });
  }
});

router.get('/:orderId', authenticateJWT, async (req, res) => {
  try {
    const admin = await Admin.findOne({
      where: { UserId: req.userId }
    });

    if (!admin) {
      return res.status(403).json({ message: 'User not admin' });
    }

    const order = await Order.findOne({ where: { id: req.params.orderId } });

    if (!order) {
      return res.status(404).json({ message: 'Invalid order id' });
    }

    const dataPayload = {
      order: order
    };

    return res.json({
      message: 'success',
      data: dataPayload
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something went wrong' });
  }
});

router.post('/ship/:orderId', [expressJson, authenticateJWT], async (req, res) => {
  try {
    const admin = await Admin.findOne({
      where: { UserId: req.userId }
    });

    if (!admin) {
      return res.status(403).json({ message: 'User not admin' });
    }

    // Validate input
    const error = validateShip(req.body);
    if (error !== '') {
      return res.status(400).json({ message: error });
    }

    const order = await Order.findOne({
      where: {
        id: req.params.orderId,
        status: 'preparing_for_shipment'
      }
    });

    if (!order) {
      return res.status(400).json({ message: 'Invalid order' });
    }

    order.status = 'shipped';
    order.carrier = req.body.carrier;
    order.trackingNumber = req.body.trackingNumber;
    order.shippedAt = Date.now();

    const savedOrder = await order.save();

    const dataPayload = savedOrder;

    return res.json({
      message: 'success',
      data: dataPayload
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something went wrong' });
  }
});

router.post('/cancel/:orderId', authenticateJWT, async (req, res) => {
  try {
    const admin = await Admin.findOne({
      where: { UserId: req.userId }
    });

    if (!admin) {
      return res.status(403).json({ message: 'User not admin' });
    }

    const order = await Order.findOne({ where: { id: req.params.orderId } });

    if (!order) {
      return res.status(400).json({ message: 'Invalid order' });
    }

    if (order.status === 'canceled') {
      return res.status(400).json({ message: 'Order already canceled' });
    }

    order.status = 'canceled';
    order.canceledAt = Date.now();

    const savedOrder = await order.save();

    const dataPayload = savedOrder;

    return res.json({
      message: 'success',
      data: dataPayload
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something went wrong' });
  }
});

router.put('/:orderId', [expressJson, authenticateJWT], async (req, res) => {
  try {
    const admin = await Admin.findOne({
      where: { UserId: req.userId }
    });

    if (!admin) {
      return res.status(403).json({ message: 'User not admin' });
    }

    // Validate input
    const error = validateEdit(req.body);
    if (error !== '') {
      return res.status(400).json({ message: error });
    }

    const order = await Order.findOne({ where: { id: req.params.orderId } });

    if (!order) {
      return res.status(400).json({ message: 'Invalid order' });
    }

    if (order.status === 'awaiting_payment') {
      return res.status(400).json({ message: 'Order payment has not been processed' });
    }

    order.status = req.body.status;
    if (req.body.status === 'preparing_for_shipment') {
      order.paymentCompletedAt = Date.now();
    } else if (req.body.status === 'canceled') {
      order.canceledAt = Date.now();
    } else if (req.body.status === 'shipped') {
      order.shippedAt = Date.now();
    }
    order.carrier = req.body.carrier;
    order.trackingNumber = req.body.trackingNumber;

    const savedOrder = await order.save();

    const dataPayload = savedOrder;

    return res.json({
      message: 'success',
      data: dataPayload
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something went wrong' });
  }
});

module.exports = router;
