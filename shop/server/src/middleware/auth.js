const jwt = require('jsonwebtoken');

function readToken(req) {
  const header = req.headers.authorization || '';
  return header.startsWith('Bearer ') ? header.slice(7) : '';
}

function auth(req, res, next) {
  const token = readToken(req);
  if (!token) {
    return next(Object.assign(new Error('请先登录'), { status: 401 }));
  }
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    next(Object.assign(new Error('登录已过期，请重新登录'), { status: 401 }));
  }
}

function optionalAuth(req, res, next) {
  const token = readToken(req);
  if (!token) return next();
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    req.user = null;
  }
  next();
}

module.exports = { auth, optionalAuth };
