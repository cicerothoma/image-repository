const multer = require("multer");
const Image = require("./../models/imageModel");
const catchAsync = require("./../utils/catchAsync");
const uploadFile = require("../utils/uploadFile");
const sendResponse = require("./../utils/sendResponse");

// Multer Storage Engine
const multerStorage = multer.memoryStorage();

// Multer File Filter
const multerFilter = (req, file, cb) => {
  if (file.mimetype.includes("image")) {
    return cb(null, true);
  } else {
    return cb(new Error("Only Images are allowed"), false);
  }
};

const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

exports.getFiles = upload.array("images", 4);

exports.uploadFilesToCloudinary = catchAsync(async (req, res, next) => {
  if (req.files && req.files.length > 0) {
    const imageURLs = [];
    const filesPromise = req.files.map(async (file) => {
      return await uploadFile(req, file.buffer);
    });
    const resolvedFiles = await Promise.all(filesPromise);
    resolvedFiles.forEach((res) => {
      if (res.resource_type === "image") {
        imageURLs.push(res.url);
      }
    });
    req.body.images = imageURLs;
  }
  next();
});

exports.addImage = catchAsync(async (req, res, next) => {
  const newImage = await Image.create({
    images: req.body.images,
    user: req.body.user,
    imageCaption: req.body.imageCaption,
    isPrivate: req.body.isPrivate,
    imageTag: req.body.imageTag,
  });
  sendResponse(newImage, res, 200);
});

exports.getAllPublicImage = catchAsync(async (req, res, next) => {
  const images = await Image.find({
    isPrivate: false,
  });

  sendResponse(images, res, 200, { result: true });
});

exports.getImage = catchAsync(async (req, res, next) => {
  const image = await Image.findById(req.params.imageID);
  if (!image) {
    return next(new Error(`Can't find image with ID: ${req.params.imageID}`));
  }
  if (
    !image.isPrivate ||
    (image.isPrivate && String(req.user._id) === String(image.user))
  ) {
    sendResponse(image, res, 200);
  } else {
    return next(
      new Error(
        `Image is not public and you don't have enough pemission to view this`
      )
    );
  }
});

exports.deleteImage = catchAsync(async (req, res, next) => {
  const image = await Image.findById(req.params.imageID);
  if (!image) {
    return next(new Error(`Can't find image with ID: ${req.params.imageID}`));
  }
  if (String(req.user._id) !== String(image.user)) {
    return next(new Error("You can only delete images you own"));
  }
  await image.deleteOne();

  sendResponse(null, res, 204, {
    message: "Your Image Has Been Deleted Successfully",
  });
});

exports.findImageByTag = catchAsync(async (req, res, next) => {
  const images = await Image.find({
    isPrivate: false,
    imageTag: req.body.tag,
  });

  if (!images) {
    return next(new Error(`cannot find image with tag ${req.body.tag}`));
  }

  sendResponse(images, res, 200, { result: true });
});
