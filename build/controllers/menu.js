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

var _menu = require("../middleware/validation/menu");

var _menu2 = _interopRequireDefault(_menu);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var MenuController = {
  addToMenu: function addToMenu(req, res) {
    _jsonwebtoken2.default.verify(req.token, process.env.SECRET_KEY, async function (err, token) {
      if (err) {
        res.status(400).json({ error: err.message });
      } else {
        if (token.username.includes("admin") || token.username.includes("canteen")) {
          var valid = (0, _menu2.default)(req.body);

          if (valid.failed) {
            res.status(400).json(valid);
            return;
          }
          if (valid.error) {
            res.status(500).json(valid);
            return;
          }

          var client = await _promise2.default.createConnection(_db2.default);

          var _ref = await client.query("SELECT * FROM menu WHERE name = ? AND category = ?", [valid.success.name, valid.success.category]),
              _ref2 = _slicedToArray(_ref, 2),
              rows = _ref2[0],
              rows_ = _ref2[1];

          if (rows.length) {
            res.status(400).json({ error: "This food item has been added!" });
            return;
          }

          await client.query("INSERT INTO menu (name, quantity, price, category, status, image_url) VALUES(?, ?, ?, ?, ?, ?)", [].concat(_toConsumableArray(Object.values(valid.success))));

          client.end();
          res.send({ status: "food item added successfully" });
          return;
        }
        res.status(401).json({ error: "Access Denied!" });
        return;
      }
    });
  },
  getMenu: async function getMenu(req, res) {
    var client = await _promise2.default.createConnection(_db2.default);
    var today = new Date().toISOString().slice(0, 10);

    var _ref3 = await client.query("SELECT *, DATE_FORMAT(date_added, '%Y-%m-%d') AS date_added FROM menu WHERE status = ? AND date_added", ["Available", today]),
        _ref4 = _slicedToArray(_ref3, 2),
        menu = _ref4[0],
        vals = _ref4[1];

    if (!menu.length) {
      client.end();
      res.send({ menu: false });
      return;
    }

    client.end();
    res.send({ menu: menu });
    return;
  },
  updateQuantity: function updateQuantity(req, res) {
    _jsonwebtoken2.default.verify(req.token, process.env.SECRET_KEY, async function (err, token) {
      if (err) {
        res.status(400).json({ error: err.message });
      } else {
        if (token.username.includes("admin") || token.username.includes("canteen")) {
          var status = "available";
          if (req.body.quantity < 5) {
            status = "unavailable";
          }

          var client = await _promise2.default.createConnection(_db2.default);
          await client.query("UPDATE menu SET quantity = ?, status = ? WHERE id = ?", [req.body.quantity, status, req.params.menu_id]);
          client.end();
          res.send({ status: "food item updated successfully" });
          return;
        }

        res.status(401).json({ error: "Access Denied!" });
        return;
      }
    });
  }
};

// const menuController =
exports.default = MenuController;