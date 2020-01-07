import mysql from "mysql2/promise";
import databaseConfig from "../models/db";

import jwt from "jsonwebtoken";
import menuValidation from "../middleware/validation/menu";

class MenuController {
  async addToMenu(req, res) {
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
            rows_
          ] = await client.query(
            `SELECT * FROM menu WHERE name = ? AND category = ?`,
            [valid.success.name, valid.success.category]
          );

          if (rows.length) {
            res.status(400).json({ error: "This food item has been added!" });
            return;
          }

          await client.query(
            `INSERT INTO menu (name, quantity, price, category, status, image_url) VALUES(?, ?, ?, ?, ?, ?)`,
            [...Object.values(valid.success)]
          );

          client.end();
          res.send({ status: "food item added successfully" });
          return;
        }
        res.status(401).json({ error: "Access Denied!" });
        return;
      }
    });
  }

  async getMenu(req, res) {
    const client = await mysql.createConnection(databaseConfig);
    const today = new Date().toISOString().slice(0, 10);
    const [
      menu,
      vals
    ] = await client.query(
      `SELECT *, DATE_FORMAT(date_added, '%Y-%m-%d') AS date_added FROM menu WHERE date_added`,
      [today]
    );

    if (!menu.length) {
      client.end();
      res.send({ menu: false });
      return;
    }

    client.end();
    res.send({ menu });
    return;
  }

  async updateQuantity(req, res) {
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
  }
}

// const menuController =
export default new MenuController();
