import express from "express";

import {
  get,
  updatePassword,
  update2FA,
} from "../controllers/securitypageController.js"; // Assure-toi que updateName est bien exportée

const securitypageRouter = express.Router();

// Route pour afficher la page
securitypageRouter.get("/", get);

// Route API pour modifier le password
securitypageRouter.post("/update-password", updatePassword);

securitypageRouter.post("/update-2fa", update2FA);

export { securitypageRouter };
