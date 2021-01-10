const multer = require("multer");
const User = require("./../models/userModel");
const catchAsync = require("./../utils/catchAsync");
const sendResponse = require("./../utils/sendResponse");
const uploadFile = require("./../utils/uploadFile");

const filterObject = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((key) => {
    if (allowedFields.includes(key)) {
      newObj[key] = obj[key];
    }
  });

  return newObj;
};

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.includes("image")) {
    cb(null, true);
  } else {
    cb(new Error(`Only Image Files Are Allowed`), false);
  }
};

const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();
  sendResponse(users, res, 200, { result: true });
});

exports.updateUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const updatedUser = await User.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!updatedUser) {
    return next(new Error(`Can't find user with id: ${id}`));
  }
  sendResponse(updatedUser, res);
});
exports.getUser = (req, res, next) => {
  res.status(200).json({
    status: "fail",
    message: "This route is not yet implemented",
  });
};
exports.deleteUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const user = await User.findByIdAndDelete(id);
  if (!user) {
    return next(new Error(`Can't find user with id: ${id}`));
  }
  res.status(204).json({
    status: "success",
    message: "User successfully deleted",
  });
});

exports.getImage = upload.single("file");

exports.uploadProfileImage = catchAsync(async (req, res, next) => {
  if (req.file) {
    const response = await uploadFile(req, req.file.buffer, {
      folder: `${req.user._id}/profile`,
      resource_type: "image",
      public_id: req.user._id,
      overwrite: true,
    });
    req.body.profileImage = response.url;
  }
  next();
});

exports.updateProfile = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.confirmPassword || req.body.email) {
    return next(
      new Error(
        'This route is not for password or email update. Please use "/updateMyPassword" for password update or "/sendResetEmailToken" for email reset instead'
      )
    );
  }
  const filteredUserData = filterObject(
    req.body,
    "profileImage",
    "name",
    "username",
    "dateOfBirth",
    "bio",
    "phone"
  );
  if (req.body.profileImage) {
    filteredUserData.profileImage = req.body.profileImage;
  }
  const newUser = await User.findByIdAndUpdate(req.user._id, filteredUserData, {
    new: true,
    runValidators: true,
  });
  sendResponse(newUser, res, 200, { message: "Profile Updated Successfully" });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { active: false },
    { new: true, runValidators: true }
  );

  if (!user) {
    return next(new Error(`Can't find user with id: ${req.user._id}`));
  }
  sendResponse(user, res, 204, {
    message: "Your Account Has Been Successfully Deleted",
  });
});
