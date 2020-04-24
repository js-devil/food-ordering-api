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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var TokenController = {
  generateToken: function generateToken(req, res) {
    _jsonwebtoken2.default.verify(req.token, process.env.SECRET_KEY, async function (err, token) {
      if (err) {
        res.status(400).json({ error: err.message });
      } else {
        if (token.username.includes("admin") || token.username.includes("canteen")) {
          var _client = await _promise2.default.createConnection(_db2.default);
          if (req.body.number_of_tokens && req.body.amount) {
            for (var i = 1; i <= req.body.number_of_tokens; ++i) {
              // console.log(i+" - "+String(Math.ceil(Math.random(2)*1e16)))
              await _client.query("INSERT INTO tokens(token, amount, date_added) VALUES(?, ?, current_timestamp())", [String(Math.ceil(Math.random(2) * 1e16)), req.body.amount]);
            }

            _client.end();
            res.send({
              status: req.body.number_of_tokens + " tokens were generated successfully"
            });
            return;
          }
          res.status(401).json({ error: "Amount and Number of tokens can't be empty!" });
          return;
        }

        res.status(401).json({ error: "Access Denied!" });
        return;
      }
    });
  },
  loadToken: function loadToken(req, res) {
    _jsonwebtoken2.default.verify(req.token, process.env.SECRET_KEY, async function (err, user) {
      if (err) {
        res.status(400).json({ error: err.message });
      } else {
        if (user.username.includes("admin") || user.username.includes("canteen")) {
          res.send({ error: "Access Denied!" });
          client.end();
          return;
        }

        if (req.body.token) {
          var _client2 = await _promise2.default.createConnection(_db2.default);

          var _ref = await _client2.query("SELECT * FROM tokens WHERE token=?", [req.body.token]),
              _ref2 = _slicedToArray(_ref, 2),
              rows = _ref2[0],
              valss = _ref2[1];

          if (!rows.length) {
            res.send({ error: "Invalid token!" });
            _client2.end();
            return;
          }

          if (rows[0].available == 0) {
            res.send({ error: "This token has been used!" });
            _client2.end();
            return;
          }

          await _client2.query("UPDATE users SET balance = balance + ? WHERE id = ?", [rows[0].amount, user.id]);

          await _client2.query("UPDATE tokens SET available = 0, used_by = ?, date_used = current_timestamp() WHERE id = ?", [user.id, rows[0].id]);

          var _ref3 = await _client2.query("SELECT * FROM users WHERE id = ?", [user.id]),
              _ref4 = _slicedToArray(_ref3, 2),
              row_bals = _ref4[0],
              vals = _ref4[1];

          var balance = row_bals[0].balance;

          res.send({ status: "Token loaded successfully!", balance: balance });
          _client2.end();
          return;
        }
      }
    });
  },
  getTokens: function getTokens(req, res) {
    _jsonwebtoken2.default.verify(req.token, process.env.SECRET_KEY, async function (err, token) {
      if (err) {
        res.status(400).json({ error: err.message });
      } else {
        if (token.username.includes("admin") || token.username.includes("canteen")) {
          var _client3 = await _promise2.default.createConnection(_db2.default);

          var _ref5 = await _client3.query("SELECT * FROM tokens"),
              _ref6 = _slicedToArray(_ref5, 2),
              tokens = _ref6[0],
              vals = _ref6[1];

          res.send({ tokens: tokens });
          _client3.end();
          return;
        }

        res.status(401).json({ error: "Access Denied!" });
        return;
      }
    });
  }
};

exports.default = TokenController;