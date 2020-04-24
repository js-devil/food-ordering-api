"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _joi = require("@hapi/joi");

var _joi2 = _interopRequireDefault(_joi);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var registration = function registration(payload) {
  try {
    var registerSchema = _joi2.default.object({
      username: _joi2.default.string().min(6).max(20).required(),
      phone: _joi2.default.string().length(11),
      location: _joi2.default.string().min(8),
      password: _joi2.default.string().alphanum().min(6).max(20).required()
    });

    var username = payload.username,
        phone = payload.phone,
        password = payload.password,
        location = payload.location;

    var _registerSchema$valid = registerSchema.validate({
      username: username,
      phone: phone,
      password: password,
      location: location
    }),
        error = _registerSchema$valid.error,
        value = _registerSchema$valid.value;

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

exports.default = registration;