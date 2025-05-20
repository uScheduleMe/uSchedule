/* eslint-disable @typescript-eslint/no-var-requires */

const { aliasWebpack, aliasJest } = require('react-app-alias');

const options = {};

module.exports = aliasWebpack(options);
module.exports.jest = aliasJest(options);
