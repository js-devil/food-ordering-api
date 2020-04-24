"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _express = require("express");

var _express2 = _interopRequireDefault(_express);

var _menu = require("../controllers/menu");

var _menu2 = _interopRequireDefault(_menu);

var _auth = require("../middleware/authentication/auth");

var _auth2 = _interopRequireDefault(_auth);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var router = _express2.default.Router();

// add food item to menu list route
router.post("", _auth2.default, _menu2.default.addToMenu);

// get all foods on the menu for that day route
router.get("", _menu2.default.getMenu);

router.post("/:menu_id/update", _auth2.default, _menu2.default.updateQuantity);

exports.default = router;