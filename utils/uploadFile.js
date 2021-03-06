const catchAsync = require("./catchAsync");
const uploadFromBuffer = require("./uploadFromBuffer");

const uploadFile = async (
  req,
  buffer,
  options = {
    folder: `imageRepo/${req.user._id}`,
    resource_type: "image",
    timeout: 600000,
  }
) => {
  const uploadResponse = await uploadFromBuffer(req, buffer, options);
  return uploadResponse;
};

module.exports = uploadFile;
