const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const accessToken = req.headers?.authorization.split(' ')[1];

  if (!accessToken) {
    throw new Error('Unauthorized: access token missing');
  }

  jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, (error, user) => {
    if (error) return next(new Error('Token is not valid!'));
    req.user = user;

    console.log(req.user);
    res.setHeader('Authorization', `Bearer ${accessToken}`);
    next();
  });
};

const auth = (req, res, next) => {
  verifyToken(req, res, next, () => {
    if (req.user.id === req.params.id || req.user.isAdmin) {
      next();
    } else {
      res.status(403).json({ message: 'You are not authorized!' });
    }
  });
};

const isAdmin = (req, res, next) => {
  verifyToken(req, res, next, () => {
    if (req.user.isAdmin) {
      next();
    } else {
      res.status(403).json({ message: 'You are not authorized!' });
    }
  });
};

module.exports = { auth, isAdmin };
