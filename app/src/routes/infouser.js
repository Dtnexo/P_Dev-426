import express from "express";

import {
  get,
  updateName,
  uploadProfilePicture,
  getProfilePicture,
  upload,
} from "../controllers/infouserController.js";

const infouserRouter = express.Router();

// Route pour afficher la page
infouserRouter.get("/", get);

// Route API pour modifier le nom
infouserRouter.post("/update-name", updateName);

infouserRouter.post(
  "/upload_profile_picture",
  upload.single("profile_picture"),
  uploadProfilePicture
);
infouserRouter.get("/photo/:id", getProfilePicture);

export { infouserRouter };
