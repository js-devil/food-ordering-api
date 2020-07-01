import mysql from "mysql2/promise";
import databaseConfig from "../models/db";
require("dotenv").config();

import jwt from "jsonwebtoken";
import menuValidation from "../middleware/validation/menu";

const MenuController = {
  addToMenu(req, res) {
    jwt.verify(req.token, process.env.SECRET_KEY, async (err, token) => {
      if (err) {
        res.status(400).json({ error: err.message });
      } else {
        if (
          token.username.includes("admin") ||
          token.username.includes("canteen")
        ) {
          const valid = menuValidation(req.body);

          if (valid.failed) {
            res.status(400).json(valid);
            return;
          }
          if (valid.error) {
            res.status(500).json(valid);
            return;
          }

          const client = await mysql.createConnection(databaseConfig);
          const [
            rows,
            rows_,
          ] = await client.query(
            `SELECT * FROM menu WHERE name = ? AND category = ?`,
            [valid.success.name, valid.success.category]
          );

          if (rows.length) {
            res.status(400).json({ error: "This food item has been added!" });
            return;
          }

          const [
            new_query,
            querss,
          ] = await client.query(
            `INSERT INTO menu (name, quantity, price, category, status, image_url) VALUES(?, ?, ?, ?, ?, ?)`,
            [...Object.values(valid.success)]
          );

          const id = new_query.insertId;
          const {
            name,
            quantity,
            price,
            category,
            status,
            image_url,
          } = valid.success;

          const item = {
            id,
            name,
            quantity,
            price,
            category,
            status,
            image_url,
            date_added: new Date().toISOString().slice(0, 10),
          };

          client.end();
          res.send({ status: "food item added successfully", item });
          return;
        }
        res.status(401).json({ error: "Access Denied!" });
        return;
      }
    });
  },

  async getMenu(req, res) {
    const client = await mysql.createConnection(databaseConfig);
    const today = new Date().toISOString().slice(0, 10);
    const [menu, vals] = await client.query(
      // `SELECT *, DATE_FORMAT(date_added, '%Y-%m-%d') AS date_added FROM menu WHERE status = ? AND date_added=?`,
      // ["Available", today]
      `SELECT *, DATE_FORMAT(date_added, '%Y-%m-%d') AS date_added FROM menu WHERE status = ?`,
      ["Available"]
    );

    if (!menu.length) {
      client.end();
      res.send({ menu: false });
      return;
    }

    client.end();
    res.send({ menu });
    return;
  },

  updateQuantity(req, res) {
    jwt.verify(req.token, process.env.SECRET_KEY, async (err, token) => {
      if (err) {
        res.status(400).json({ error: err.message });
      } else {
        if (
          token.username.includes("admin") ||
          token.username.includes("canteen")
        ) {
          let status = "available";
          if (req.body.quantity < 5) {
            status = "unavailable";
          }

          const client = await mysql.createConnection(databaseConfig);
          await client.query(
            `UPDATE menu SET quantity = ?, status = ? WHERE id = ?`,
            [req.body.quantity, status, req.params.menu_id]
          );
          client.end();
          res.send({ status: "food item updated successfully" });
          return;
        }

        res.status(401).json({ error: "Access Denied!" });
        return;
      }
    });
  },

  updateMenu(req, res) {
    jwt.verify(req.token, process.env.SECRET_KEY, async (err, token) => {
      if (err) {
        res.status(400).json({ error: err.message });
      } else {
        if (
          !token.username.includes("admin") &&
          !token.username.includes("canteen")
        )
          return res.status(401).json({ error: "Access Denied!" });

        const { category, name, price, quantity, status } = req.body;

        const client = await mysql.createConnection(databaseConfig);
        await client.query(
          `UPDATE menu SET category=?, name=?, price=?, quantity = ?, status = ? WHERE id = ?`,
          [category, name, price, quantity, status, req.params.menu_id]
        );

        client.end();
        res.send({ status: "food item updated successfully" });
        return;
      }
    });
  },

  deleteMenu(req, res) {
    jwt.verify(req.token, process.env.SECRET_KEY, async (err, token) => {
      if (err) {
        res.status(400).json({ error: err.message });
      } else {
        if (
          !token.username.includes("admin") &&
          !token.username.includes("canteen")
        )
          return res.status(401).json({ error: "Access Denied!" });

        const client = await mysql.createConnection(databaseConfig);
        await client.query(`DELETE FROM menu WHERE id = ?`, [
          req.params.menu_id,
        ]);

        client.end();
        res.send({ status: "food item deleted successfully" });
        return;
      }
    });
  },
};

// const menuController =
export default MenuController;
