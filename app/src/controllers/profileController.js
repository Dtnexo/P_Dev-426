import "dotenv/config";
import { queryDatabase } from "../db/dbConnect.js";

const get = async (req, res) => {
  let historique;
  let response;
  try {
    const user_id = await queryDatabase(
      `SELECT user_id FROM t_user WHERE username='${req.session.user.username}'`
    );
    const historique = await queryDatabase(
      `SELECT * FROM t_liste_favoris fav JOIN t_sites site ON site.site_id=fav.site_id WHERE fav.user_id='${user_id[0].user_id}'`
    );
    response = await fetch(
      "http://localhost:3003/api/continentWheel?user_id=" + user_id[0].user_id
    );
  } catch (error) {
    console.error("Erreur lors de la récupération des sites:", error);
  }

  const rawData = await response.json();
  const chartData = {
    labels: rawData.map((item) => item.continent),
    values: rawData.map((item) => item.nombre_sites),
  };

  res.render("profile", {
    user: req.session.user || null,
    chartData: chartData,
    historique: historique,
  });
};

export { get };
