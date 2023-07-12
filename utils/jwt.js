const jwt = require('jsonwebtoken');

const generateToken = ({ payload }) => {
  return jwt.sign(payload, process.env.JWT_SECRET);
};

function validateToken(token) {
  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    return decodedToken;
  } catch (error) {
    throw new Error('Token verification failed');
  }
}

const cookiesResponse = ({ res, user, refresh }) => {
  const accessToken = generateToken({ payload: { user } });
  const refreshToken = generateToken({ payload: { user, refresh } });

  const day = 24 * 60 * 60 * 1000;
  const longerDay = 30 * 24 * 60 * 60 * 1000;

  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    signed: true,
    expires: new Date(Date.now() + day),
  });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    signed: true,
    expires: new Date(Date.now() + longerDay),
  });
};

module.exports = {
  generateToken,
  validateToken,
  cookiesResponse,
};
