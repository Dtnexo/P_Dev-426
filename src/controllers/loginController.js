const { queryDatabase } = require("../db/dbConnect.js");
const crypto = require("crypto");
// Example query
module.exports = {
  get: (req, res) => {
    res.render("../views/login");
  },
  authenticateUser: async (req, res) => {
    // Récupérer le sel de l'utilisateur sur la base de données
    const sel = await queryDatabase(
      `SELECT Sel FROM t_user WHERE Username = '${req.body.username}';`
    );
    // Stocker la valeur du sel
    const selResult = sel[0].Sel;

    // Récupérer le mot de passe sur le form et la base de donnée,
    // hasher le mdp du form avec le sel et le comparer au mdp de la db
    const password = await queryDatabase(
      `SELECT Password FROM t_user WHERE Username = '${
        req.body.username
      }' AND Password LIKE '${crypto
        .createHash("sha256")
        .update(selResult + req.body.password)
        .digest("hex")}';`
    );
    if (password == "") {
      console.log("le mot de passe ou le username est incorrect!");
    } else {
      console.log("Bravo vous êtes authentifié!");
    }
  },
};
