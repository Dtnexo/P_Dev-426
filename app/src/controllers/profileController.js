import "dotenv/config";
import { queryDatabase } from "../db/dbConnect.js";

const get = async (req, res) => {
  let historique;
  try {
    const user_id = await queryDatabase(
      `SELECT user_id FROM t_user Where username='${req.session.user.username}'`
    );
    const historique = await queryDatabase(
      `SELECT * FROM t_liste_favoris fav JOIN t_sites site ON site.site_id=fav.site_id WHERE fav.user_id='${user_id[0].user_id}'`
    );
    console.log(user_id[0].user_id);
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
