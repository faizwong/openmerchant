const router = require('express').Router();

const authenticateJWT = require('../../../../../middlewares/authenticateJWT');
const {
  Admin,
  User
} = require('../../../../../models');

router.get('/test', (req, res) => {
  return res.json({ message: 'admin/users' });
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

    const { count, rows } = await User.findAndCountAll({
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
      users: rows,
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

router.get('/:userId', authenticateJWT, async (req, res) => {
  try {
    const admin = await Admin.findOne({
      where: { UserId: req.userId }
    });

    if (!admin) {
      return res.status(403).json({ message: 'User not admin' });
    }

    const user = await User.findOne({ where: { id: req.params.userId } });

    if (!user) {
      return res.status(404).json({ message: 'Invalid user id' });
    }

    const dataPayload = {
      user: user
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

router.delete('/:userId', authenticateJWT, async (req, res) => {
  try {
    const admin = await Admin.findOne({
      where: { UserId: req.userId }
    });

    if (!admin) {
      return res.status(403).json({ message: 'User not admin' });
    }

    const user = await User.findOne({ where: { id: req.params.userId } });
    if (!user) {
      return res.status(400).json({ message: 'Invalid user id' });
    }

    const userIsAdmin = await Admin.findOne({
      where: { UserId: user.id }
    });
    if (userIsAdmin) {
      return res.status(403).json({ message: 'Unable to delete admin user' });
    }

    await user.destroy();
    return res.json({
      message: 'success'
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something went wrong' });
  }
});

module.exports = router;
