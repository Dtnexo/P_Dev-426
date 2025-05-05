import "dotenv/config";
import { queryDatabase } from "../db/dbConnect.js";

const get = async (req, res) => {
  let historique;
  try {
    const name = await queryDatabase(
      `SELECT username FROM t_user Where user_id='${req.session.user.user_id}'`
    );
    console.log(name);
    req.session.user.username = name[0].username;
    const historique = await queryDatabase(
      `SELECT * FROM t_avoir av JOIN t_sites si ON si.site_id = av.site_id JOIN t_liste_favoris fav ON fav.liste_favoris_id = av.liste_favoris_id WHERE fav.user_id = '${req.session.user.user_id}'`
    );
    console.log(historique);
  } catch (error) {
    console.error("Erreur lors de la récupération des sites:", error);
  }
  const chartData = {
    labels: ["dsaas", "dsdfaf", "eqwewqe", "dsadasd"],
    values: [10, 20, 30, 40],
  };

  res.render("profile", {
    user: req.session.user || null,
    chartData: chartData,
    historique: historique,
  });
};

export { get };
