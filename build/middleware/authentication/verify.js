"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _jsonwebtoken = require("jsonwebtoken");

var _jsonwebtoken2 = _interopRequireDefault(_jsonwebtoken);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var verifyToken = function verifyToken(token) {
  _jsonwebtoken2.default.verify(token, process.env.SECRET_KEY, function (err, data) {
    if (err) {
      return { error: err.message };
    } else {
      return { data: data };
    }
  });
};

exports.default = verifyToken;