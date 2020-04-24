"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _promise = require("mysql2/promise");

var _promise2 = _interopRequireDefault(_promise);

var _db = require("../models/db");

var _db2 = _interopRequireDefault(_db);

var _jsonwebtoken = require("jsonwebtoken");

var _jsonwebtoken2 = _interopRequireDefault(_jsonwebtoken);

var _bcryptjs = require("bcryptjs");

var _bcryptjs2 = _interopRequireDefault(_bcryptjs);

var _register = require("../middleware/validation/register");

var _register2 = _interopRequireDefault(_register);

var _login = require("../middleware/validation/login");

var _login2 = _interopRequireDefault(_login);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var UserController = {
  register: async function register(req, res) {
    try {
      var validated = (0, _register2.default)(req.body);

      if (validated.failed) {
        res.status(400).json(validated);
        return;
      }

      if (validated.error) {
        res.status(500).json(validated);
        return;
      }

      var hash = await _bcryptjs2.default.hash(req.body.password, 10);
      var client = await _promise2.default.createConnection(_db2.default);

      var _ref = await client.query("SELECT * FROM users WHERE username = ? OR phone=?", [req.body.username, req.body.phone]),
          _ref2 = _slicedToArray(_ref, 2),
          rows = _ref2[0],
          fields = _ref2[1];

      if (rows.length > 0) {
        res.status(400).json({
          error: "this username or phone number is already registered"
        });
        client.end();
        return;
      }

      var _ref3 = await client.query("INSERT INTO users (username, phone, password) VALUES (?, ?, ?)", [].concat(_toConsumableArray(Object.values(validated.success).slice(0, 2)), [hash])),
          _ref4 = _slicedToArray(_ref3, 2),
          query = _ref4[0],
          valsq = _ref4[1];

      var id = query.insertId;

      client.end();
      var token = _jsonwebtoken2.default.sign({
        id: id,
        username: req.body.username
      }, process.env.SECRET_KEY, { expiresIn: "30m" });
      res.send({
        token: token,
        username: req.body.username,
        image_url: null,
        balance: 0
      });
      return;
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  },
  login: async function login(req, res, next) {
    try {
      var validated = (0, _login2.default)(req.body);

      if (validated.failed) {
        res.status(400).json(validated);
        return;
      }

      if (validated.error) {
        res.status(500).json(validated);
        return;
      }

      var client = await _promise2.default.createConnection(_db2.default);

      var _ref5 = await client.query("SELECT * FROM users WHERE username = ?", req.body.username),
          _ref6 = _slicedToArray(_ref5, 2),
          rows = _ref6[0],
          fields = _ref6[1];

      if (rows.length < 1) {
        res.status(400).json({ error: "This user does not exist" });
        client.end();
        return;
      }

      client.end();

      var validPassword = await _bcryptjs2.default.compare(req.body.password, rows[0].password);
      if (validPassword) {
        var _rows$ = rows[0],
            id = _rows$.id,
            username = _rows$.username,
            image_url = _rows$.image_url,
            balance = _rows$.balance;

        var token = _jsonwebtoken2.default.sign({ id: id, username: username }, process.env.SECRET_KEY, {
          expiresIn: "30m"
        });

        res.send({ token: token, username: username, image_url: image_url, balance: balance });
        return;
      }

      res.status(400).json({ error: "invalid password" });
      return;
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  },
  changePassword: function changePassword(req, res) {
    _jsonwebtoken2.default.verify(req.token, process.env.SECRET_KEY, async function (err, user) {
      if (err) {
        res.status(400).json({ error: err.message });
      } else {
        var id = user.id;

        var client = await _promise2.default.createConnection(_db2.default);

        var _req$body = req.body,
            old_password = _req$body.old_password,
            new_password = _req$body.new_password;

        var _ref7 = await client.query("SELECT * FROM users WHERE id = ?", id),
            _ref8 = _slicedToArray(_ref7, 2),
            rows = _ref8[0],
            fields = _ref8[1];

        if (!rows.length) {
          res.status(400).json({ error: "This user does not exist" });
          client.end();
          return;
        }

        var validPassword = await _bcryptjs2.default.compare(old_password, rows[0].password);

        if (validPassword) {
          var hash = await _bcryptjs2.default.hash(new_password, 10);
          await client.query("UPDATE users SET password=? WHERE id = ?", [hash, id]);
          client.end();
          res.send({ status: "Password has been changed!" });
          return;
        }

        client.end();
        res.status(400).json({ error: "invalid password" });
        return;
      }
    });
  },
  changeAvatar: function changeAvatar(req, res) {
    _jsonwebtoken2.default.verify(req.token, process.env.SECRET_KEY, async function (err, user) {
      if (err) {
        res.status(400).json({ error: err.message });
      } else {
        var id = user.id;

        var client = await _promise2.default.createConnection(_db2.default);

        var _ref9 = await client.query("SELECT * FROM users WHERE id = ?", [id]),
            _ref10 = _slicedToArray(_ref9, 2),
            rows = _ref10[0],
            fields = _ref10[1];

        if (!rows.length) {
          res.status(400).json({ error: "This user does not exist" });
          client.end();
          return;
        }

        await client.query("UPDATE users SET image_url=? WHERE id = ?", [req.body.image_url, id]);
        client.end();
        res.send({ status: "Your avatar has been changed!" });
        return;
      }
    });
  }
};

exports.default = UserController;