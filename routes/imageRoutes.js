const express = require("express");
const authController = require("./../controllers/authController");
const imageController = require("./../controllers/imageController");

const router = express.Router();

router.use(authController.protect);

router
  .route("/")
  .post(
    imageController.getFiles,
    imageController.uploadFilesToCloudinary,
    imageController.addImage
  )
  .get(imageController.getAllPublicImage);

router.route("/tag").get(imageController.findImageByTag);

router
  .route("/:imageID")
  .get(imageController.getImage)
  .delete(imageController.deleteImage);

module.exports = router;
