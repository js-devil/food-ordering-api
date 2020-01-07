import mysql from "mysql2/promise";
import databaseConfig from "../models/db";

import jwt from "jsonwebtoken";

const cancelExpired = (date) => {
  return (new Date() - new Date(date) > 10*60*1000) ? true : false
}

class OrderController {
  async makeOrder(req, res) {
    jwt.verify(req.token, process.env.SECRET_KEY, async (err, user) => {
      if (err) {
        res.status(400).json({ error: err.message });
      } else {
        // if (
        //   user.username.includes("admin") ||
        //   user.username.includes("canteen")
        // ) {
        //   res.status(401).json({ error: "Access Denied!" });
        //   return;
        // }

        if (!req.body.order.length) {
          res
            .status(400)
            .json({ error: "Please select your choice on the menu!" });
          return;
        }

        let value = 0;
        const cost = req.body.order.reduce((key, i) => key + i.cost, value);
        const order = JSON.stringify(req.body.order);
        const client = await mysql.createConnection(databaseConfig);
        let [query, vals] = await client.query("SELECT balance FROM users WHERE id = ?", [user.id])
        if(query[0].balance < cost) {
          res
            .status(400)
            .json({ error: "Insufficient Balance!" });
            client.end()
          return;
        }

        await client.query(
          `INSERT INTO orders(user_id, user_order, total) VALUES(?, ?, ?)`,
          [user.id, order, cost]
        );
        await client.query(
          `UPDATE users SET balance = balance - ? WHERE id = ?`,
          [cost, user.id]
        );
        res.send({ status: "Order placed successfully!" });
        client.end();
        return;
      }
    });
  }

  async getOrders(req, res) {
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
          let [
            orders,
            vals
          ] = await client.query(
            `SELECT orders.user_order, orders.total, orders.answered, DATE_FORMAT(orders.time_of_order, '%Y-%m-%d') AS time_of_order, users.username AS username, users.image_url AS user_img FROM orders INNER JOIN users ON users.id = orders.user_id WHERE time_of_order=? AND cancelled=0 AND answered=0`,
            [today]
          );

          if (!orders.length) {
            res.send({ orders: false });
            client.end();
            return;
          }

          orders = orders.map(key => {
            const { username, total, answered, user_img, time_of_order } = key
            return {
              // ...key,
              username,
              total,
              answered,
              user_img,
              time_of_order,
              order: JSON.parse(key.user_order)
            };
          });

          res.send({ orders });
          client.end();
          return;
        }

        res.status(401).json({ error: "Access Denied!" });
        return;
      }
    });
  }

  async attendToOrder(req, res) {
    jwt.verify(req.token, process.env.SECRET_KEY, async (err, token) => {
      if (err) {
        res.status(400).json({ error: err.message });
      } else {
        if (
          token.username.includes("admin") ||
          token.username.includes("canteen")
        ) {
          // req.params.order_id
          const client = await mysql.createConnection(databaseConfig);

          let [query, vals] = await client.query("SELECT * FROM orders WHERE id=?", [req.params.order_id])
          if(!query.length) {
            res.status(400).json({ error: "Invalid request!" });
            client.end()
            return;
          }

          if(query[0].cancelled==1) {
            res.status(400).json({ error: "Oops! This order has been cancelled" });
            client.end()
            return;
          }

          await client.query("UPDATE orders SET answered=1 WHERE id=?", [req.params.order_id])
          res.send({ status: "Order confirmed successfully!" });
          client.end();
          return;
        }

        res.status(401).json({ error: "Access Denied!" });
        return;
      }
    });
  }

  async cancelOrder(req, res) {
    jwt.verify(req.token, process.env.SECRET_KEY, async (err, user) => {
      if (err) {
        res.status(400).json({ error: err.message });
      } else {
        // if (
        //   user.username.includes("admin") ||
        //   user.username.includes("canteen")
        // ) {
        //   res.status(401).json({ error: "Access Denied!" });
        //   return;
        // }

        const client = await mysql.createConnection(databaseConfig);

        let [query, vals] = await client.query("SELECT * FROM orders WHERE id=? AND user_id=?", [req.params.order_id, user.id])
        if(!query.length) {
          res.status(400).json({ error: "Invalid request!" });
          client.end()
          return;
        }

        if(query[0].answered==1) {
          res.status(400).json({ error: "Oops! This order has been tended to" });
          client.end()
          return;
        }

        const expired = cancelExpired(query[0].time_of_order)
        if(expired) {
          res.status(400).json({ error: "Period of cancellation has expired" });
          client.end()
          return;
        }

        await client.query("UPDATE orders SET cancelled=1 WHERE id=?", [req.params.order_id])
        await client.query(
          `UPDATE users SET balance = balance + ? WHERE id = ?`,
          [query[0].total, user.id]
        );
        res.send({ status: "Order cancelled successfully!" });
        client.end();
        return;
      }
    });
  }
}

const orderController = new OrderController();
export default orderController;
