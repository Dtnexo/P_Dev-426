import { queryDatabase } from "../db/dbConnect.js";
import crypto from "crypto";

const get = (req, res) => {
  res.render("../views/register");
};

const createUser = async (req, res) => {
  const salt = crypto.randomBytes(25).toString("base64");

    const username = req.body.username;

    const hashedPassword = crypto
      .createHash("sha256")
      .update(salt + req.body.password)
      .digest("hex");

    const isExist = await queryDatabase(
      `SELECT username FROM t_user WHERE username LIKE ?`,
      [username]
    );
    if (isExist.length === 0) {
      await queryDatabase(
        `INSERT INTO t_user (username, salt, password) VALUES(?,?,?);`,
        [username, salt, hashedPassword]
      );
      const token = jwt.sign({ username: username }, process.env.SECRET_KEY, {
        expiresIn: "1h",
      });
      // httpOnly pour que le côté client n'accède pas au cookie, maxAge pour que le cookie expire dans 1h
      res.cookie("token", token, { httpOnly: true, maxAge: 3600000 });
      res.redirect("/user");
    } else {
      res.render("../views/register", {
        error: "This username is already used !",
      });
    }
};

export { createUser, get };
