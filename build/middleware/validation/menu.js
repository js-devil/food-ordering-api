"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _joi = require("@hapi/joi");

var _joi2 = _interopRequireDefault(_joi);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var newMenu = function newMenu(payload) {
  try {
    var foodItemSchema = _joi2.default.object({
      name: _joi2.default.string().min(6).max(30).required(),
      quantity: _joi2.default.number().max(200).required(),
      price: _joi2.default.number().min(50).max(200).required(),
      category: _joi2.default.string().min(4).max(30).required(),
      status: _joi2.default.string().min(6).max(30).required(),
      image_url: _joi2.default.string().uri().lowercase()
    });

    var name = payload.name,
        quantity = payload.quantity,
        price = payload.price,
        category = payload.category,
        status = payload.status,
        image_url = payload.image_url;

    var _foodItemSchema$valid = foodItemSchema.validate({
      name: name,
      quantity: quantity,
      price: price,
      category: category,
      status: status,
      image_url: image_url
    }),
        error = _foodItemSchema$valid.error,
        value = _foodItemSchema$valid.value;

    if (error === undefined || typeof error === "undefined") {
      return { success: value };
    } else {
      var errorMsg = error.details.map(function (errorObject) {
        return errorObject.message;
      });
      return { failed: errorMsg };
    }
  } catch (e) {
    return { error: e.message, trace: e.stack };
  }
};

exports.default = newMenu;