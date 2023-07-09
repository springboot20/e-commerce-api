const customErrors = require('../errors/customError');
const { validateToken } = require('../utils/jwt');

const auth = (req, res, next) => {
  let token;
  const authHeader = req.headers?.authorization;

  if (authHeader && authHeader.startWith('Bearer')) {
    token = authHeader.split(' ')[1];
  } else if (res.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    throw new customErrors.UnAuthenticated('Authentication invalid');
  }

  try {
    const payload = validateToken(token);

    req.user = {
      userId: payload.user.userId,
      role: payload.user.role,
    };

    next();
  } catch (error) {
    throw new customErrors.UnAuthenticated('Authenticated invalid');
  }
};

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new customErrors.UnAuthorized('Unauthorized to access this route');
    }
    next();
  };
};

module.exports = { auth, authorizeRoles };
