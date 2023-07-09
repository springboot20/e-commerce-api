const customErrors = require('../errors/customError');

const checkPermission = (requestUser, resourceUserId) => {
  console.log(requestUser);
  if (requestUser.role === 'admin') return;
  if (requestUser.userId === resourceUserId.toString()) return;
  throw new customErrors.UnAuthorized('Not authorized to access this route');
};

module.exports = checkPermission;
