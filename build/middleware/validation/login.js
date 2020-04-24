"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _joi = require("@hapi/joi");

var _joi2 = _interopRequireDefault(_joi);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var login = function login(payload) {
  try {
    var loginSchema = _joi2.default.object({
      username: _joi2.default.string().min(6).max(20).required(),
      password: _joi2.default.string().alphanum().min(6).max(20).required(),
      location: _joi2.default.string().min(8)
    });

    var username = payload.username,
        password = payload.password,
        location = payload.location;

    var _loginSchema$validate = loginSchema.validate({
      username: username,
      password: password,
      location: location
    }),
        error = _loginSchema$validate.error,
        value = _loginSchema$validate.value;

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

exports.default = login;