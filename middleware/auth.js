const jsonwebtoken = require('jsonwebtoken');
const validator = require('validator');
const User = require('../models/User');

const PUB_KEY = Buffer.from(process.env.PUB_KEY, 'base64').toString('utf-8');

const AppError = require('../AppError.js');
const { wrapAsync } = require('../util');

const isAuth = wrapAsync(async (req, res, next) => {
  if (!req.header('authorization'))
    throw new AppError(401, 'no token provided');

  const tokenParts = req.headers.authorization.split(' ');
  const user = await verifyToken(tokenParts);
  req.user = user; // attach user to request object
  next();
});

const verifyToken = async (tokenParts) => {
  if (
    tokenParts[0] !== 'Bearer' ||
    !tokenParts[1] ||
    !validator.isJWT(tokenParts[1])
  )
    throw new AppError(401, 'invalid token format');

  const tokenPayload = jsonwebtoken.verify(tokenParts[1], PUB_KEY, {
    algorithms: ['RS256'],
  });

  const userId = tokenPayload.sub;
  const user = await User.findById(userId);
  return user;
};

module.exports = {
  isAuth,
  verifyToken,
};
