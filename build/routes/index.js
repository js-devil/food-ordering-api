"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _users = require("./users");

var _users2 = _interopRequireDefault(_users);

var _menu = require("./menu");

var _menu2 = _interopRequireDefault(_menu);

var _tokens = require("./tokens");

var _tokens2 = _interopRequireDefault(_tokens);

var _orders = require("./orders");

var _orders2 = _interopRequireDefault(_orders);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var routes = {
  users: _users2.default,
  menu: _menu2.default,
  tokens: _tokens2.default,
  orders: _orders2.default
};

exports.default = routes;