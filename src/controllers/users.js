import mysql from "mysql2/promise";
import databaseConfig from "../models/db";
require("dotenv").config();

import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

import registerValidation from "../middleware/validation/register";
import loginValidation from "../middleware/validation/login";

const UserController = {
  async register(req, res) {
    try {
      const validated = registerValidation(req.body);

      if (validated.failed) {
        res.status(400).json(validated);
        return;
      }

      if (validated.error) {
        res.status(500).json(validated);
        return;
      }

      const hash = await bcrypt.hash(req.body.password, 10);
      const client = await mysql.createConnection(databaseConfig);

      const [
        rows,
        fields,
      ] = await client.query(
        `SELECT * FROM users WHERE username = ? OR phone=?`,
        [req.body.username, req.body.phone]
      );
      if (rows.length > 0) {
        res.status(400).json({
          error: "this username or phone number is already registered",
        });
        client.end();
        return;
      }

      let [
        query,
        valsq,
      ] = await client.query(
        `INSERT INTO users (username, phone, password) VALUES (?, ?, ?)`,
        [...Object.values(validated.success).slice(0, 2), hash]
      );
      const id = query.insertId;

      client.end();
      const token = jwt.sign(
        {
          id,
          username: req.body.username,
        },
        process.env.SECRET_KEY,
        { expiresIn: "2h" }
      );
      res.send({
        token,
        username: req.body.username,
        image_url: null,
        balance: 0,
      });
      return;
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  },

  async login(req, res, next) {
    try {
      const validated = loginValidation(req.body);

      if (validated.failed) {
        res.status(400).json(validated);
        return;
      }

      if (validated.error) {
        res.status(500).json(validated);
        return;
      }

      const client = await mysql.createConnection(databaseConfig);
      const [rows, fields] = await client.query(
        `SELECT * FROM users WHERE username = ?`,
        req.body.username
      );
      if (rows.length < 1) {
        res.status(400).json({ error: "This user does not exist" });
        client.end();
        return;
      }

      client.end();

      const validPassword = await bcrypt.compare(
        req.body.password,
        rows[0].password
      );
      if (validPassword) {
        const { id, username, image_url, balance } = rows[0];
        const token = jwt.sign({ id, username }, process.env.SECRET_KEY, {
          expiresIn: "2h",
        });

        res.send({ token, username, image_url, balance });
        return;
      }

      res.status(400).json({ error: "invalid password" });
      return;
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  },

  changePassword(req, res) {
    jwt.verify(req.token, process.env.SECRET_KEY, async (err, user) => {
      if (err) {
        res.status(400).json({ error: err.message });
      } else {
        const { id } = user;
        const client = await mysql.createConnection(databaseConfig);

        const { old_password, new_password } = req.body;

        const [rows, fields] = await client.query(
          `SELECT * FROM users WHERE id = ?`,
          id
        );
        if (!rows.length) {
          res.status(400).json({ error: "This user does not exist" });
          client.end();
          return;
        }

        const validPassword = await bcrypt.compare(
          old_password,
          rows[0].password
        );

        if (validPassword) {
          const hash = await bcrypt.hash(new_password, 10);
          await client.query(`UPDATE users SET password=? WHERE id = ?`, [
            hash,
            id,
          ]);
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

  changeAvatar(req, res) {
    jwt.verify(req.token, process.env.SECRET_KEY, async (err, user) => {
      if (err) {
        res.status(400).json({ error: err.message });
      } else {
        const { id } = user;
        const client = await mysql.createConnection(databaseConfig);

        const [
          rows,
          fields,
        ] = await client.query(`SELECT * FROM users WHERE id = ?`, [id]);
        if (!rows.length) {
          res.status(400).json({ error: "This user does not exist" });
          client.end();
          return;
        }

        await client.query(`UPDATE users SET image_url=? WHERE id = ?`, [
          req.body.image_url,
          id,
        ]);
        client.end();
        res.send({ status: "Your avatar has been changed!" });
        return;
      }
    });
  },
};

export default UserController;
