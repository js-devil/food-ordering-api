"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _jsonwebtoken = require("jsonwebtoken");

var _jsonwebtoken2 = _interopRequireDefault(_jsonwebtoken);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var splitLoginToken = function splitLoginToken(req, res, next) {
  //get auth header value
  var bearerHeader = req.headers["authorization"];

  //get token of bearer header !== undefined
  if (typeof bearerHeader !== "undefined") {
    var bearer = bearerHeader.split(" ");
    req.token = bearer[1];
    next();
  } else {
    res.status(401).json("Access Denied!");
  }
};

exports.default = splitLoginToken;