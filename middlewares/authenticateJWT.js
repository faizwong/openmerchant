const jwt = require('jsonwebtoken');

const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.TOKEN_SECRET, (err, result) => {
      if (err) {
        // return res.sendStatus(403);
        return res.status(403).json({ message: 'Forbidden access' });
      }

      req.userId = result.userId;
      next();
    });
  } else {
    return res.status(403).json({ message: 'Unauthorized access' });
  }
};

module.exports = authenticateJWT;
