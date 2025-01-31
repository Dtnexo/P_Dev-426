import { queryDatabase } from "../db/dbConnect.js";
import crypto from "crypto";

const get = (req, res) => {
  res.render("../views/register");
};

const createUser = async (req, res) => {
  const salt = crypto.randomBytes(25).toString("base64");

  const encryptedPassword = crypto
    .createHash("sha256")
    .update(salt + req.body.password)
    .digest("hex");

  await queryDatabase(
    `INSERT INTO t_user (Username, Sel, Password) VALUES('${req.body.username}', '${salt}','${encryptedPassword}');`
  );

  res.render("../views/login");
};

export { createUser, get };
