import express from "express";

import { get, updateName } from "../controllers/securitypageController.js"; // Assure-toi que updateName est bien exportée

const securitypageRouter = express.Router();

// Route pour afficher la page
securitypageRouter.get("/", get);

// Route API pour modifier le nom
securitypageRouter.post("/update-name", updateName);

export { securitypageRouter };
