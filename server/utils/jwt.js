const jwt = require('jsonwebtoken');

// Use a constant secret if the environment variable is not set
const JWT_SECRET = process.env.JWT_SECRET || 'a_very_secure_fixed_secret_key_for_testing_only';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

/**
 * Generate JWT token
 * @param {Object} payload - Data to be included in the token
 * @returns {String} - JWT token
 */
const generateToken = (payload) => {
  return jwt.sign(
    payload,
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

/**
 * Verify JWT token
 * @param {String} token - JWT token to verify
 * @returns {Object} - Decoded token or error
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

module.exports = {
  generateToken,
  verifyToken
}; 