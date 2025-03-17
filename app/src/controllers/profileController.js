import "dotenv/config";
const get = (req, res) => {
  console.log(req.session.user);
  res.render("profile", { user: req.session.user || null });
};

export { get };
