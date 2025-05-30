const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ msg: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user || user.activeToken !== token) {
      return res.status(401).json({ msg: 'Session expired or logged in elsewhere' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ msg: 'Invalid token' });
  }
};

module.exports = auth;
