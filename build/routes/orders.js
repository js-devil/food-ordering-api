"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _express = require("express");

var _express2 = _interopRequireDefault(_express);

var _orders = require("../controllers/orders");

var _orders2 = _interopRequireDefault(_orders);

var _auth = require("../middleware/authentication/auth");

var _auth2 = _interopRequireDefault(_auth);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var router = _express2.default.Router();

// make order route
router.post("/order", _auth2.default, _orders2.default.makeOrder);
router.post("/order/:order_id/answer", _auth2.default, _orders2.default.attendToOrder);
router.post("/order/:order_id/cancel", _auth2.default, _orders2.default.cancelOrder);
router.post("/order/:order_id/reorder", _auth2.default, _orders2.default.reorder);

// get all orders for that day route
router.get("/orders/all", _auth2.default, _orders2.default.getAllOrders);
router.get("/orders", _auth2.default, _orders2.default.getOrders);

exports.default = router;