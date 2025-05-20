module.exports = (message) => {
  // Check data type of message
  // Note: Arrays are allowed with 'object' check
  if (typeof message !== 'string' && typeof message !== 'object') {
    throw new SyntaxError('Message must be a string, array, or object.');
  }
};
