import jwt from "jsonwebtoken";
import "dotenv/config";

const auth = (req, res, next) => {
  if (!req.cookies.P_Dev) {
    const message = `Vous n'avez pas fourni de jeton d'authentification. Ajoutez-en un dans les cookies.`;
    return res.redirect("/login");
  } else {
    jwt.verify(
      req.cookies.P_Dev,
      process.env.SECRET_KEY,
      (error, decodedToken) => {
        if (error) {
          const message = `L'utilisateur n'est pas autorisé à accéder à cette ressource.`;
          return res.status(401).json({ message, data: error });
        }
        console.log(decodedToken);
        const { username, user_id } = decodedToken;
        if (req.body.username && req.body.username !== username) {
          const message = `Le nom d'utilisateur est invalide`;
          return res.status(401).json({ message });
        } else {
          req.session.user = { username, user_id };
          next();
        }
      }
    );
  }
};

export { auth };
