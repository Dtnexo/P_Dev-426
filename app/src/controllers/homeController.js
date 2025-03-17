import jwt from "jsonwebtoken";
import "dotenv/config";
const get = (req, res) => {
  console.log(req.session.user);
  res.render("home", { user: req.session.user || null });
};

export { get };
