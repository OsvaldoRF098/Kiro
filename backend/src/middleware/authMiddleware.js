const jwt = require('jsonwebtoken');

/**
 * Express middleware that verifies a JWT Bearer token from the Authorization header.
 * - If the header is absent or doesn't start with "Bearer " → HTTP 401 { message: "Token no proporcionado" }
 * - If the token is invalid or expired → HTTP 401 { message: "Token inválido" }
 * - If valid → attaches the decoded payload to req.user and calls next()
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token no proporcionado' });
  }

  const token = authHeader.slice(7); // Remove "Bearer " prefix

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token inválido' });
  }
}

module.exports = { verifyToken };
