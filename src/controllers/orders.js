import mysql from "mysql2/promise";
import databaseConfig from "../models/db";

import jwt from "jsonwebtoken";
require("dotenv").config();

const cancelExpired = (date) => {
  return new Date() - new Date(date) > 10 * 60 * 1000 ? true : false;
};

const OrderController = {
  makeOrder(req, res) {
    jwt.verify(req.token, process.env.SECRET_KEY, async (err, user) => {
      if (err) {
        res.status(400).json({ error: err.message });
      } else {
        if (
          user.username.includes("admin") ||
          user.username.includes("canteen")
        ) {
          res.status(401).json({ error: "Access Denied!" });
          return;
        }

        let { order, total } = req.body;

        if (!order.length) {
          res
            .status(400)
            .json({ error: "Please select your choice on the menu!" });
          return;
        }

        const client = await mysql.createConnection(databaseConfig);
        let [
          query,
          vals,
        ] = await client.query("SELECT balance FROM users WHERE id = ?", [
          user.id,
        ]);
        if (query[0].balance < total) {
          res.status(400).json({ error: "Insufficient Balance!" });
          client.end();
          return;
        }

        order = JSON.stringify(order);
        await client.query(
          `INSERT INTO orders(user_id, user_order, total) VALUES(?, ?, ?)`,
          [user.id, order, total]
        );

        for (let user_order of req.body.order) {
          const [
            rows,
            vals,
          ] = await client.query(`SELECT quantity FROM menu WHERE id = ?`, [
            user_order.id,
          ]);
          if (user_order.user_quantity > rows[0].quantity) {
            res.status(400).json({
              error: `You can only buy ${user_order.name} worth N${
                rows[0].price * rows[0].quantity
              } `,
            });
            client.end();
            return;
          }

          await client.query(
            `UPDATE menu SET quantity = quantity - ? WHERE id = ?`,
            [user_order.user_quantity, user_order.id]
          );

          if (rows[0].quantity == 1) {
            await client.query(`UPDATE menu SET status=? WHERE id = ?`, [
              "Unavailable",
              user_order.id,
            ]);
          }
        }

        await client.query(
          `UPDATE users SET balance = balance - ? WHERE id = ?`,
          [total, user.id]
        );
        res.send({ status: "Order placed successfully!" });
        client.end();
        return;
      }
    });
  },

  reorder(req, res) {
    jwt.verify(req.token, process.env.SECRET_KEY, async (err, user) => {
      if (err) {
        res.status(400).json({ error: err.message });
      } else {
        if (
          user.username.includes("admin") ||
          user.username.includes("canteen")
        ) {
          res.status(401).json({ error: "Access Denied!" });
          return;
        }

        const client = await mysql.createConnection(databaseConfig);

        let [
          prev_order,
          prev_vals,
        ] = await client.query(
          `SELECT user_order, total FROM orders WHERE id = ?`,
          [req.params.order_id]
        );
        let { user_order, total } = prev_order[0];

        if (req.body.balance < total) {
          res.status(400).json({ error: "Insufficient Balance!" });
          client.end();
          return;
        }

        for (let item of JSON.parse(user_order)) {
          const [
            menu_item,
            item_vsl,
          ] = await client.query(
            `SELECT price, quantity FROM menu WHERE id = ?`,
            [item.id]
          );
          if (item.quantity > menu_item[0].quantity) {
            let price = menu_item[0].price * menu_item[0].quantity;
            let error = `You can only buy ${item.name} worth N${price} `;
            if (!price) {
              error = `${item.name} is finished at the moment`;
            }
            res.status(400).json({ error });
            client.end();
            return;
          }

          // return
          await client.query(
            `UPDATE menu SET quantity = quantity - ? WHERE id = ?`,
            [item.quantity, item.id]
          );

          if (menu_item[0].quantity == 1) {
            await client.query(`UPDATE menu SET status=? WHERE id = ?`, [
              "Unavailable",
              user_order.id,
            ]);
          }
        }

        await client.query(
          `INSERT INTO orders(user_id, user_order, total) VALUES(?, ?, ?)`,
          [user.id, user_order, total]
        );

        await client.query(
          `UPDATE users SET balance = balance - ? WHERE id = ?`,
          [total, user.id]
        );
        res.send({
          status: "This order has been reordered!",
          balance: req.body.balance - total,
        });
        client.end();
        return;
      }
    });
  },

  getAllOrders(req, res) {
    jwt.verify(req.token, process.env.SECRET_KEY, async (err, token) => {
      if (err) {
        res.status(400).json({ error: err.message });
      } else {
        if (
          token.username.includes("admin") ||
          token.username.includes("canteen")
        ) {
          const today = new Date().toISOString().slice(0, 10);
          const client = await mysql.createConnection(databaseConfig);
          let [orders, vals] = await client.query(
            // `SELECT orders.id, orders.user_order, orders.total, orders.completed, DATE_FORMAT(orders.time_of_order, '%Y-%m-%d') AS time_of_order, users.username AS username, users.image_url AS user_img FROM orders INNER JOIN users ON users.id = orders.user_id WHERE time_of_order=?`,
            // [today]
            `SELECT orders.id, orders.user_order, orders.total, orders.completed, DATE_FORMAT(orders.time_of_order, '%Y-%m-%d') AS time_of_order, users.username AS username, users.image_url AS user_img FROM orders INNER JOIN users ON users.id = orders.user_id`
          );

          if (!orders.length) {
            res.send({ orders: false });
            client.end();
            return;
          }

          orders = orders.map((key) => {
            key.order = JSON.parse(key.user_order);
            return Object.assign({}, key);
          });

          res.send({ orders });
          client.end();
          return;
        }

        res.status(401).json({ error: "Access Denied!" });
        return;
      }
    });
  },

  getOrders(req, res) {
    jwt.verify(req.token, process.env.SECRET_KEY, async (err, user) => {
      if (err) {
        res.status(400).json({ error: err.message });
      } else {
        if (
          user.username.includes("admin") ||
          user.username.includes("canteen")
        ) {
          res.status(401).json({ error: "Access Denied!" });
          return;
        }

        const client = await mysql.createConnection(databaseConfig);
        let [
          orders,
          vals,
        ] = await client.query(
          `SELECT *, DATE_FORMAT(orders.time_of_order, '%Y-%m-%d') AS time_of_order FROM orders WHERE user_id=?`,
          [user.id]
        );
        if (!orders.length) {
          res.send({ orders: false });
          client.end();
          return;
        }

        res.send({ orders });
        client.end();
        return;
      }
    });
  },

  attendToOrder(req, res) {
    jwt.verify(req.token, process.env.SECRET_KEY, async (err, token) => {
      if (err) {
        res.status(400).json({ error: err.message });
      } else {
        if (
          token.username.includes("admin") ||
          token.username.includes("canteen")
        ) {
          const client = await mysql.createConnection(databaseConfig);

          let [
            query,
            vals,
          ] = await client.query("SELECT * FROM orders WHERE id=?", [
            req.params.order_id,
          ]);
          if (!query.length) {
            res.status(400).json({ error: "Invalid request!" });
            client.end();
            return;
          }

          if (query[0].completed == 0) {
            res
              .status(400)
              .json({ error: "Oops! This order has been cancelled" });
            client.end();
            return;
          }

          await client.query("UPDATE orders SET completed=1 WHERE id=?", [
            req.params.order_id,
          ]);
          res.send({ status: "Order confirmed successfully!" });
          client.end();
          return;
        }

        res.status(401).json({ error: "Access Denied!" });
        return;
      }
    });
  },

  cancelOrder(req, res) {
    jwt.verify(req.token, process.env.SECRET_KEY, async (err, user) => {
      if (err) {
        res.status(400).json({ error: err.message });
      } else {
        if (
          user.username.includes("admin") ||
          user.username.includes("canteen")
        ) {
          res.status(401).json({ error: "Access Denied!" });
          return;
        }

        const client = await mysql.createConnection(databaseConfig);

        let [
          query,
          vals,
        ] = await client.query(
          "SELECT * FROM orders WHERE id=? AND user_id=?",
          [req.params.order_id, user.id]
        );
        if (!query.length) {
          res.status(400).json({ error: "Invalid request!" });
          client.end();
          return;
        }

        if (query[0].completed == 1) {
          res
            .status(400)
            .json({ error: "Oops! This order has been completed!" });
          client.end();
          return;
        }

        const expired = cancelExpired(query[0].time_of_order);
        if (expired) {
          res.status(400).json({ error: "Period of cancellation has expired" });
          client.end();
          return;
        }

        const order = JSON.parse(query[0].user_order);

        await client.query("UPDATE orders SET completed=0 WHERE id=?", [
          req.params.order_id,
        ]);
        await client.query(
          `UPDATE users SET balance = balance + ? WHERE id = ?`,
          [query[0].total, user.id]
        );

        for (let user_order of order) {
          await client.query(
            `UPDATE menu SET quantity = quantity + ? WHERE id = ?`,
            [user_order.user_quantity, user_order.id]
          );
        }

        const [
          row_bals,
          valsss,
        ] = await client.query(`SELECT * FROM users WHERE id = ?`, [user.id]);
        const { balance } = row_bals[0];
        res.send({ status: "This order has been cancelled", balance });
        client.end();
        return;
      }
    });
  },
};

export default OrderController;
