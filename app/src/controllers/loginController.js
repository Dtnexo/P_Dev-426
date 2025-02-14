import { queryDatabase } from "../db/dbConnect.js";
import crypto from "crypto";

const get = (req, res) => {
  res.render("../views/login");
};

const authenticateUser = async (req, res) => {
  try {
    const username = req.body.username;
    // Récupérer le sel de l'utilisateur sur la base de données
    const sel = await queryDatabase(
      `SELECT salt FROM t_user WHERE username = ?;`,
      [username]
    );
    console.log(sel);
    // Stocker la valeur du sel
    const selResult = sel[0].salt;

    const hashedPassword = crypto
      .createHash("sha256")
      .update(selResult + req.body.password)
      .digest("hex");

    // Récupérer le mot de passe sur le form et la base de donnée,
    // hasher le mdp du form avec le sel et le comparer au mdp de la db
    const password = await queryDatabase(
      `SELECT password FROM t_user WHERE username = ? AND password LIKE ?;`,
      [username, hashedPassword]
    );
    if (password.length === 0) {
      console.log(password);
      res.render("../views/login", {
        error: "The username or the password is incorrect !",
      });
    } else {
      const token = jwt.sign({ username: username }, process.env.SECRET_KEY, {
        expiresIn: "1h",
      });
      // httpOnly pour que le côté client n'accède pas au cookie, maxAge pour que le cookie expire dans 1h
      res.cookie("token", token, { httpOnly: true, maxAge: 3600000 });
      res.redirect("/user");
    }
  } catch (error) {
    console.log(error);
    res.render("../views/login", {
      error: "The username or the password is incorrect !",
    });
  }
};
export { get, authenticateUser };
