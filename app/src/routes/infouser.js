import express from "express";
import { get, updateName } from "../controllers/infouserController.js"; // Assure-toi que updateName est bien exportée

const infouserRouter = express.Router();

// Route pour afficher la page
infouserRouter.get("/", get);

// Route API pour modifier le nom
infouserRouter.post("/update-name", updateName);

export { infouserRouter };
