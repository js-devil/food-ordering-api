import mysql from "mysql2/promise";
import databaseConfig from "../models/db";

import jwt from "jsonwebtoken";

const TokenController = {
  generateToken(req, res) {
    jwt.verify(req.token, process.env.SECRET_KEY, async (err, token) => {
      if (err) {
        res.status(400).json({ error: err.message });
      } else {
        if (
          token.username.includes("admin") ||
          token.username.includes("canteen")
        ) {
          const client = await mysql.createConnection(databaseConfig);
          if (req.body.number_of_tokens && req.body.amount) {
            for (let i = 1; i <= req.body.number_of_tokens; ++i) {
              // console.log(i+" - "+String(Math.ceil(Math.random(2)*1e16)))
              await client.query(
                "INSERT INTO tokens(token, amount, date_added) VALUES(?, ?, current_timestamp())",
                [String(Math.ceil(Math.random(2) * 1e16)), req.body.amount]
              );
            }

            client.end();
            res.send({
              status: `${req.body.number_of_tokens} tokens were generated successfully`,
            });
            return;
          }
          res
            .status(401)
            .json({ error: "Amount and Number of tokens can't be empty!" });
          return;
        }

        res.status(401).json({ error: "Access Denied!" });
        return;
      }
    });
  },

  loadToken(req, res) {
    jwt.verify(req.token, process.env.SECRET_KEY, async (err, user) => {
      if (err) {
        res.status(400).json({ error: err.message });
      } else {
        if (
          user.username.includes("admin") ||
          user.username.includes("canteen")
        ) {
          res.send({ error: "Access Denied!" });
          client.end();
          return;
        }

        if (req.body.token) {
          const client = await mysql.createConnection(databaseConfig);
          const [
            rows,
            valss,
          ] = await client.query("SELECT * FROM tokens WHERE token=?", [
            req.body.token,
          ]);

          if (!rows.length) {
            res.send({ error: "Invalid token!" });
            client.end();
            return;
          }

          if (rows[0].available == 0) {
            res.send({ error: "This token has been used!" });
            client.end();
            return;
          }

          await client.query(
            `UPDATE users SET balance = balance + ? WHERE id = ?`,
            [rows[0].amount, user.id]
          );

          await client.query(
            `UPDATE tokens SET available = 0, used_by = ?, date_used = current_timestamp() WHERE id = ?`,
            [user.id, rows[0].id]
          );

          const [
            row_bals,
            vals,
          ] = await client.query(`SELECT * FROM users WHERE id = ?`, [user.id]);
          const balance = row_bals[0].balance;

          res.send({ status: "Token loaded successfully!", balance });
          client.end();
          return;
        }
      }
    });
  },

  getTokens(req, res) {
    jwt.verify(req.token, process.env.SECRET_KEY, async (err, token) => {
      if (err) {
        res.status(400).json({ error: err.message });
      } else {
        if (
          token.username.includes("admin") ||
          token.username.includes("canteen")
        ) {
          const client = await mysql.createConnection(databaseConfig);
          const [tokens, vals] = await client.query(
            `SELECT tokens.id, tokens.amount, tokens.available, tokens.date_added, tokens.date_used, tokens.token, users.username FROM tokens LEFT JOIN users ON tokens.used_by=users.id`
          );

          res.send({ tokens });
          client.end();
          return;
        }

        res.status(401).json({ error: "Access Denied!" });
        return;
      }
    });
  },
};

export default TokenController;
