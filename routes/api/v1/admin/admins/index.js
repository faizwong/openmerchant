const router = require('express').Router();
const expressJson = require('express').json();

const authenticateJWT = require('../../../../../middlewares/authenticateJWT');
const { validateCreate } = require('./validate.js');
const {
  User,
  Admin
} = require('../../../../../models');

router.get('/test', (req, res) => {
  return res.json({ message: 'admin/admins' });
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

    const { count, rows } = await Admin.findAndCountAll({
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
      admins: rows,
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

    const newAdmin = Admin.build({
      UserId: req.body.UserId
    });

    const savedAdmin = await newAdmin.save();

    const dataPayload = savedAdmin;

    return res.json({
      message: 'success',
      data: dataPayload
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something went wrong' });
  }
});

router.get('/:adminId', authenticateJWT, async (req, res) => {
  try {
    const isAdmin = await Admin.findOne({
      where: { UserId: req.userId }
    });

    if (!isAdmin) {
      return res.status(403).json({ message: 'User not admin' });
    }

    const admin = await Admin.findOne({ where: { id: req.params.adminId } });

    if (!admin) {
      return res.status(404).json({ message: 'Invalid admin id' });
    }

    const dataPayload = {
      admin: admin
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

router.put('/:adminId', [expressJson, authenticateJWT], async (req, res) => {
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

    const adminToEdit = await User.findOne({ where: { id: req.params.adminId } });
    if (!adminToEdit) {
      return res.status(400).json({ message: 'Invalid admin id' });
    }

    adminToEdit.UserId = req.body.UserId;

    const savedAdmin = await adminToEdit.save();

    const dataPayload = savedAdmin;

    return res.json({
      message: 'success',
      data: dataPayload
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something went wrong' });
  }
});

router.delete('/:adminId', authenticateJWT, async (req, res) => {
  try {
    const admin = await Admin.findOne({
      where: { UserId: req.userId }
    });

    if (!admin) {
      return res.status(403).json({ message: 'User not admin' });
    }

    if (parseInt(req.params.adminId + '', 10) === parseInt(req.userId + '', 10)) {
      return res.status(403).json({ message: 'Unable to delete self' });
    }

    // if (req.params.adminId === req.userId) {
    //   return res.status(403).json({ message: 'Unable to delete self' });
    // }

    const adminToDelete = await Admin.findOne({ where: { id: req.params.adminId } });
    if (!adminToDelete) {
      return res.status(400).json({ message: 'Invalid admin id' });
    }

    await adminToDelete.destroy();

    return res.json({
      message: 'success'
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something went wrong' });
  }
});

module.exports = router;
