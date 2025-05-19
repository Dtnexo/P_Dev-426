import "dotenv/config";
import { queryDatabase } from "../db/dbConnect.js";

const get = async (req, res) => {
  let historique;
  let response;
  try {
    //me------------
    const user_id = await queryDatabase(
      `SELECT user_id FROM t_user Where username='${req.session.user.username}'`
    );
    const historique = await queryDatabase(
      `SELECT * FROM t_contenir co JOIN t_sites si ON si.site_id = co.site_id JOIN t_historique hist ON hist.historique_id = co.historique_id WHERE hist.user_id = '${req.session.user.user_id}'`
    );
    response = await fetch(
      "http://localhost:3003/api/continentWheel?user_id=" + user_id[0].user_id
    );
    //me------------end
    //main------------
    const name = await queryDatabase(
      `SELECT username FROM t_user Where user_id='${req.session.user.user_id}'`
    );
    console.log(name);
    req.session.user.username = name[0].username;
    const listFav = await queryDatabase(
      `SELECT * FROM t_avoir av JOIN t_sites si ON si.site_id = av.site_id JOIN t_wishlist fav ON fav.wishlist_id = av.liste_favoris_id WHERE fav.user_id = '${req.session.user.user_id}'`
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
    //main--------------------end
    console.log(user_id[0].user_id);
    console.log(historique);
  } catch (error) {
    console.error("Erreur lors de la récupération des sites:", error);
  }
  const chartData = {
    labels: ["dsaas", "dsdfaf", "eqwewqe", "dsadasd"],
    values: [10, 20, 30, 40],
  };
  //me------------
  const rawData = await response.json();
  const chartData = {
    labels: rawData.map((item) => item.continent),
    values: rawData.map((item) => item.nombre_sites),
  };
  //me---------end
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
