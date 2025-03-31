import "dotenv/config";
const get = (req, res) => {
  res.render("profile", { user: req.session.user || null });
};

export { get };
