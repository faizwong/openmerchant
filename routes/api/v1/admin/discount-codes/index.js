const router = require('express').Router();
const expressJson = require('express').json();

const authenticateJWT = require('../../../../../middlewares/authenticateJWT');
const { validateCreate } = require('./validate.js');
const {
  Admin,
  DiscountCode
} = require('../../../../../models');

router.get('/test', (req, res) => {
  return res.json({ message: 'admin/discount-codes' });
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

    const { count, rows } = await DiscountCode.findAndCountAll({
      limit: itemsPerPage,
      offset: offset,
      order: [
        ['id', 'ASC']
      ]
    });

    totalItems = count;
    totalPages = Math.ceil(count / itemsPerPage);
    currentPage = page;
    currentPageSize = rows.length;

    const dataPayload = {
      discountCodes: rows,
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

router.get('/:discountCodeId', authenticateJWT, async (req, res) => {
  try {
    const admin = await Admin.findOne({
      where: { UserId: req.userId }
    });

    if (!admin) {
      return res.status(403).json({ message: 'User not admin' });
    }

    const discountCode = await DiscountCode.findOne({ where: { id: req.params.discountCodeId } });

    if (!discountCode) {
      return res.status(404).json({ message: 'Invalid discount code id' });
    }

    const dataPayload = {
      discountCode: discountCode
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

router.post('/', [expressJson, authenticateJWT], async (req, res) => {
  try {
    const admin = await Admin.findOne({
      where: { UserId: req.userId }
    });

    if (!admin) {
      return res.status(403).json({ message: 'User not admin' });
    }

    // Validate input
    const error = validateCreate(req.body);
    if (error !== '') {
      return res.status(400).json({ message: error });
    }

    const discountCode = DiscountCode.build({
      code: req.body.code,
      discountPercentage: req.body.discountPercentage,
      isActive: req.body.isActive
    });

    const savedDiscountCode = await discountCode.save();

    const dataPayload = savedDiscountCode;

    return res.json({
      message: 'success',
      data: dataPayload
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something went wrong' });
  }
});

router.put('/:discountCodeId', [expressJson, authenticateJWT], async (req, res) => {
  try {
    const admin = await Admin.findOne({
      where: { UserId: req.userId }
    });

    if (!admin) {
      return res.status(403).json({ message: 'User not admin' });
    }

    // Validate input
    const error = validateCreate(req.body);
    if (error !== '') {
      return res.status(400).json({ message: error });
    }

    const discountCode = await DiscountCode.findOne({ where: { id: req.params.discountCodeId } });
    if (!discountCode) {
      return res.status(400).json({ message: 'Invalid discount code id' });
    }

    discountCode.code = req.body.code;
    discountCode.discountPercentage = req.body.discountPercentage;
    discountCode.isActive = req.body.isActive;

    const savedDiscountCode = await discountCode.save();

    const dataPayload = savedDiscountCode;

    return res.json({
      message: 'success',
      data: dataPayload
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something went wrong' });
  }
});

router.delete('/:discountCodeId', authenticateJWT, async (req, res) => {
  try {
    const admin = await Admin.findOne({
      where: { UserId: req.userId }
    });

    if (!admin) {
      return res.status(403).json({ message: 'User not admin' });
    }

    const discountCode = await DiscountCode.findOne({ where: { id: req.params.discountCodeId } });
    if (!discountCode) {
      return res.status(400).json({ message: 'Invalid discount code id' });
    }

    await discountCode.destroy();

    return res.json({
      message: 'success'
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something went wrong' });
  }
});

module.exports = router;
