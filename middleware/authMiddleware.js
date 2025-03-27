const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const authHeader = req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'your_jwt_secret_key'
    );
    console.log(decoded);
    if (decoded.role != 'booking') {
      req.user = {
        _id: decoded._id,
        role: decoded.role
      };
    } else {
      req.user = {
        _id: decoded.id,
        role: decoded.role,
        location_id: decoded.location_id
      };
    }
    next();
  } catch (error) {
    res.status(400).json({ error: 'Invalid token.' });
  }
};

const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ error: 'Access denied. Unauthorized role.' });
    }
    next();
  };
};

module.exports = { authMiddleware, authorizeRoles };
