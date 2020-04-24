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

var cancelExpired = function cancelExpired(date) {
  return new Date() - new Date(date) > 10 * 60 * 1000 ? true : false;
};

var OrderController = {
  makeOrder: function makeOrder(req, res) {
    _jsonwebtoken2.default.verify(req.token, process.env.SECRET_KEY, async function (err, user) {
      if (err) {
        res.status(400).json({ error: err.message });
      } else {
        if (user.username.includes("admin") || user.username.includes("canteen")) {
          res.status(401).json({ error: "Access Denied!" });
          return;
        }

        var _req$body = req.body,
            order = _req$body.order,
            total = _req$body.total;


        if (!order.length) {
          res.status(400).json({ error: "Please select your choice on the menu!" });
          return;
        }

        var client = await _promise2.default.createConnection(_db2.default);

        var _ref = await client.query("SELECT balance FROM users WHERE id = ?", [user.id]),
            _ref2 = _slicedToArray(_ref, 2),
            query = _ref2[0],
            vals = _ref2[1];

        if (query[0].balance < total) {
          res.status(400).json({ error: "Insufficient Balance!" });
          client.end();
          return;
        }

        order = JSON.stringify(order);
        await client.query("INSERT INTO orders(user_id, user_order, total) VALUES(?, ?, ?)", [user.id, order, total]);

        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = req.body.order[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var user_order = _step.value;

            var _ref3 = await client.query("SELECT quantity FROM menu WHERE id = ?", [user_order.id]),
                _ref4 = _slicedToArray(_ref3, 2),
                rows = _ref4[0],
                _vals = _ref4[1];

            if (user_order.user_quantity > rows[0].quantity) {
              res.status(400).json({
                error: "You can only buy " + user_order.name + " worth N" + rows[0].price * rows[0].quantity + " "
              });
              client.end();
              return;
            }

            await client.query("UPDATE menu SET quantity = quantity - ? WHERE id = ?", [user_order.user_quantity, user_order.id]);

            if (rows[0].quantity == 1) {
              await client.query("UPDATE menu SET status=? WHERE id = ?", ["Unavailable", user_order.id]);
            }
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator.return) {
              _iterator.return();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }

        await client.query("UPDATE users SET balance = balance - ? WHERE id = ?", [total, user.id]);
        res.send({ status: "Order placed successfully!" });
        client.end();
        return;
      }
    });
  },
  reorder: function reorder(req, res) {
    _jsonwebtoken2.default.verify(req.token, process.env.SECRET_KEY, async function (err, user) {
      if (err) {
        res.status(400).json({ error: err.message });
      } else {
        if (user.username.includes("admin") || user.username.includes("canteen")) {
          res.status(401).json({ error: "Access Denied!" });
          return;
        }

        var client = await _promise2.default.createConnection(_db2.default);

        var _ref5 = await client.query("SELECT user_order, total FROM orders WHERE id = ?", [req.params.order_id]),
            _ref6 = _slicedToArray(_ref5, 2),
            prev_order = _ref6[0],
            prev_vals = _ref6[1];

        var _prev_order$ = prev_order[0],
            user_order = _prev_order$.user_order,
            total = _prev_order$.total;


        if (req.body.balance < total) {
          res.status(400).json({ error: "Insufficient Balance!" });
          client.end();
          return;
        }

        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
          for (var _iterator2 = JSON.parse(user_order)[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var item = _step2.value;

            var _ref7 = await client.query("SELECT price, quantity FROM menu WHERE id = ?", [item.id]),
                _ref8 = _slicedToArray(_ref7, 2),
                menu_item = _ref8[0],
                item_vsl = _ref8[1];

            if (item.quantity > menu_item[0].quantity) {
              var price = menu_item[0].price * menu_item[0].quantity;
              var error = "You can only buy " + item.name + " worth N" + price + " ";
              if (!price) {
                error = item.name + " is finished at the moment";
              }
              res.status(400).json({ error: error });
              client.end();
              return;
            }

            // return
            await client.query("UPDATE menu SET quantity = quantity - ? WHERE id = ?", [item.quantity, item.id]);

            if (menu_item[0].quantity == 1) {
              await client.query("UPDATE menu SET status=? WHERE id = ?", ["Unavailable", user_order.id]);
            }
          }
        } catch (err) {
          _didIteratorError2 = true;
          _iteratorError2 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion2 && _iterator2.return) {
              _iterator2.return();
            }
          } finally {
            if (_didIteratorError2) {
              throw _iteratorError2;
            }
          }
        }

        await client.query("INSERT INTO orders(user_id, user_order, total) VALUES(?, ?, ?)", [user.id, user_order, total]);

        await client.query("UPDATE users SET balance = balance - ? WHERE id = ?", [total, user.id]);
        res.send({
          status: "This order has been reordered!",
          balance: req.body.balance - total
        });
        client.end();
        return;
      }
    });
  },
  getAllOrders: function getAllOrders(req, res) {
    _jsonwebtoken2.default.verify(req.token, process.env.SECRET_KEY, async function (err, token) {
      if (err) {
        res.status(400).json({ error: err.message });
      } else {
        if (token.username.includes("admin") || token.username.includes("canteen")) {
          var today = new Date().toISOString().slice(0, 10);
          var client = await _promise2.default.createConnection(_db2.default);

          var _ref9 = await client.query(
          // `SELECT orders.id, orders.user_order, orders.total, orders.completed, DATE_FORMAT(orders.time_of_order, '%Y-%m-%d') AS time_of_order, users.username AS username, users.image_url AS user_img FROM orders INNER JOIN users ON users.id = orders.user_id WHERE time_of_order=?`,
          // [today]
          "SELECT orders.id, orders.user_order, orders.total, orders.completed, DATE_FORMAT(orders.time_of_order, '%Y-%m-%d') AS time_of_order, users.username AS username, users.image_url AS user_img FROM orders INNER JOIN users ON users.id = orders.user_id"),
              _ref10 = _slicedToArray(_ref9, 2),
              orders = _ref10[0],
              vals = _ref10[1];

          if (!orders.length) {
            res.send({ orders: false });
            client.end();
            return;
          }

          orders = orders.map(function (key) {
            key.order = JSON.parse(key.user_order);
            return Object.assign({}, key);
          });

          res.send({ orders: orders });
          client.end();
          return;
        }

        res.status(401).json({ error: "Access Denied!" });
        return;
      }
    });
  },
  getOrders: function getOrders(req, res) {
    _jsonwebtoken2.default.verify(req.token, process.env.SECRET_KEY, async function (err, user) {
      if (err) {
        res.status(400).json({ error: err.message });
      } else {
        if (user.username.includes("admin") || user.username.includes("canteen")) {
          res.status(401).json({ error: "Access Denied!" });
          return;
        }

        var client = await _promise2.default.createConnection(_db2.default);

        var _ref11 = await client.query("SELECT *, DATE_FORMAT(orders.time_of_order, '%Y-%m-%d') AS time_of_order FROM orders WHERE user_id=?", [user.id]),
            _ref12 = _slicedToArray(_ref11, 2),
            orders = _ref12[0],
            vals = _ref12[1];

        if (!orders.length) {
          res.send({ orders: false });
          client.end();
          return;
        }

        res.send({ orders: orders });
        client.end();
        return;
      }
    });
  },
  attendToOrder: function attendToOrder(req, res) {
    _jsonwebtoken2.default.verify(req.token, process.env.SECRET_KEY, async function (err, token) {
      if (err) {
        res.status(400).json({ error: err.message });
      } else {
        if (token.username.includes("admin") || token.username.includes("canteen")) {
          var client = await _promise2.default.createConnection(_db2.default);

          var _ref13 = await client.query("SELECT * FROM orders WHERE id=?", [req.params.order_id]),
              _ref14 = _slicedToArray(_ref13, 2),
              query = _ref14[0],
              vals = _ref14[1];

          if (!query.length) {
            res.status(400).json({ error: "Invalid request!" });
            client.end();
            return;
          }

          if (query[0].completed == 0) {
            res.status(400).json({ error: "Oops! This order has been cancelled" });
            client.end();
            return;
          }

          await client.query("UPDATE orders SET completed=1 WHERE id=?", [req.params.order_id]);
          res.send({ status: "Order confirmed successfully!" });
          client.end();
          return;
        }

        res.status(401).json({ error: "Access Denied!" });
        return;
      }
    });
  },
  cancelOrder: function cancelOrder(req, res) {
    _jsonwebtoken2.default.verify(req.token, process.env.SECRET_KEY, async function (err, user) {
      if (err) {
        res.status(400).json({ error: err.message });
      } else {
        if (user.username.includes("admin") || user.username.includes("canteen")) {
          res.status(401).json({ error: "Access Denied!" });
          return;
        }

        var client = await _promise2.default.createConnection(_db2.default);

        var _ref15 = await client.query("SELECT * FROM orders WHERE id=? AND user_id=?", [req.params.order_id, user.id]),
            _ref16 = _slicedToArray(_ref15, 2),
            query = _ref16[0],
            vals = _ref16[1];

        if (!query.length) {
          res.status(400).json({ error: "Invalid request!" });
          client.end();
          return;
        }

        if (query[0].completed == 1) {
          res.status(400).json({ error: "Oops! This order has been completed!" });
          client.end();
          return;
        }

        var expired = cancelExpired(query[0].time_of_order);
        if (expired) {
          res.status(400).json({ error: "Period of cancellation has expired" });
          client.end();
          return;
        }

        var order = JSON.parse(query[0].user_order);

        await client.query("UPDATE orders SET completed=0 WHERE id=?", [req.params.order_id]);
        await client.query("UPDATE users SET balance = balance + ? WHERE id = ?", [query[0].total, user.id]);

        var _iteratorNormalCompletion3 = true;
        var _didIteratorError3 = false;
        var _iteratorError3 = undefined;

        try {
          for (var _iterator3 = order[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
            var user_order = _step3.value;

            await client.query("UPDATE menu SET quantity = quantity + ? WHERE id = ?", [user_order.user_quantity, user_order.id]);
          }
        } catch (err) {
          _didIteratorError3 = true;
          _iteratorError3 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion3 && _iterator3.return) {
              _iterator3.return();
            }
          } finally {
            if (_didIteratorError3) {
              throw _iteratorError3;
            }
          }
        }

        var _ref17 = await client.query("SELECT * FROM users WHERE id = ?", [user.id]),
            _ref18 = _slicedToArray(_ref17, 2),
            row_bals = _ref18[0],
            valsss = _ref18[1];

        var balance = row_bals[0].balance;

        res.send({ status: "This order has been cancelled", balance: balance });
        client.end();
        return;
      }
    });
  }
};

exports.default = OrderController;