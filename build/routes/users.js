"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _express = require("express");

var _express2 = _interopRequireDefault(_express);

var _users = require("../controllers/users");

var _users2 = _interopRequireDefault(_users);

var _auth = require("../middleware/authentication/auth");

var _auth2 = _interopRequireDefault(_auth);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var router = _express2.default.Router();


// login route
router.post("/login", _users2.default.login);

// register route
router.post("/register", _users2.default.register);
router.post("/change-password", _auth2.default, _users2.default.changePassword);
router.post("/change-avatar", _auth2.default, _users2.default.changeAvatar);

exports.default = router;