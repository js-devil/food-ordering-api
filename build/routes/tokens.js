"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _express = require("express");

var _express2 = _interopRequireDefault(_express);

var _tokens = require("../controllers/tokens");

var _tokens2 = _interopRequireDefault(_tokens);

var _auth = require("../middleware/authentication/auth");

var _auth2 = _interopRequireDefault(_auth);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var router = _express2.default.Router();

// add food item to token list route
router.post("/generate", _auth2.default, _tokens2.default.generateToken);

// get all foods on the token for that day route
router.get("", _auth2.default, _tokens2.default.getTokens);

router.post("/load", _auth2.default, _tokens2.default.loadToken);

exports.default = router;