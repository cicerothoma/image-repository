const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema({
  images: {
    type: [String],
    required: [true, "provide image url"],
  },
  imageCaption: String,
  isPrivate: {
    type: Boolean,
    default: false,
  },
  user: {
    type: mongoose.Types.ObjectId,
    required: [true, "Image must belong to a user"],
  },
  imageTag: String,
});

const Image = mongoose.model("Image", imageSchema);

module.exports = Image;
