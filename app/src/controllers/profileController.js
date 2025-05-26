import "dotenv/config";
import { queryDatabase } from "../db/dbConnect.js";

const get = async (req, res) => {
  let historique;
  try {
    const name = await queryDatabase(
      `SELECT username FROM t_user Where user_id='${req.session.user.user_id}'`
    );
    req.session.user.username = name[0].username;
    const listFav = await queryDatabase(
      `SELECT * FROM t_avoir av JOIN t_sites si ON si.site_id = av.site_id JOIN t_wishlist fav ON fav.wishlist_id = av.liste_favoris_id WHERE fav.user_id = '${req.session.user.user_id}'`
    );
    const historique = await queryDatabase(
      `SELECT * FROM t_contenir co JOIN t_sites si ON si.site_id = co.site_id JOIN t_historique hist ON hist.historique_id = co.historique_id WHERE hist.user_id = '${req.session.user.user_id}'`
    );
    const totalHist = historique.length;
    const counts = historique.reduce((acc, site) => {
      acc[site.continent] = (acc[site.continent] || 0) + 1;
      return acc;
    }, {});
    const result = Object.entries(counts).map(([continent, count]) => ({
      continent,
      count,
      percentage: ((count / totalHist) * 100).toFixed(1),
    }));
    const chartData = {
      labels: result.map((r) => r.continent + ` (${r.percentage}%)`),
      values: result.map((r) => r.percentage), // valeurs numériques (sans le %)
    };

    res.render("profile", {
      user: req.session.user || null,
      chartData: chartData,
      historique: historique,
    });
    console.table(result);
  } catch (error) {
    console.error("Erreur lors de la récupération des sites:", error);
  }
};

export { get };
