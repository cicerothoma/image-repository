const crypto = require("crypto");
const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const tokenEncrypt = require("./../utils/tokenEncrypt");

const userSchema = new mongoose.Schema(
  {
    dateJoined: {
      type: Date,
      required: true,
      default: Date.now(),
      immutable: true,
    },
    name: {
      type: String,
      required: [true, "Please provide your name"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Please provide your email"],
      lowercase: true,
      validate: [validator.isEmail, "Please provide a valid email"],
      unique: [true, "Email is already in use by another user"],
    },
    dateOfBirth: {
      type: Date,
      required: [true, "Please provide date of birth"],
    },
    phone: String,
    profileImage: {
      type: String,
      default: "default.jpg",
    },
    password: {
      type: String,
      minlength: 8,
    },
    confirmPassword: {
      type: String,
      minlength: 8,
      validate: {
        // Custom validators only works for saving documents to the database and doesn't work for updating them
        validator: function (val) {
          return val === this.password;
        },
        message: "Password and Confirm Password Fields do not match",
      },
    },
    active: {
      type: Boolean,
      default: true,
    },
    passwordResetTokenExpires: Date,
    passwordChangedAt: Date,
    passwordResetToken: String,
  },
  {
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
    strict: true,
  }
);
// Document Middleware
userSchema.pre("save", async function (next) {
  // 1) Hash Password
  this.password = await bcrypt.hash(this.password, 12);
  // 2) Remove confirmPassword field
  this.confirmPassword = undefined;
  next();
});

userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) {
    return next();
  }
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

// Query Middleware

// Instance Methods
userSchema.methods.correctPassword = async (plainPassword, hashedPassword) => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    // Convert the pasword changed time to timestamp
    // The Reason why we divide by 1000 is because the changedTimestamp is in milliseconds while
    // the JWTTimestamp is in seconds so we need to make sure they're both in the same format
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  // False means the password has not been changed
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = tokenEncrypt(resetToken);

  // Set the password reset token to expire in 10 minutes
  this.passwordResetTokenExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

// MongoDB Indexing
userSchema.index({ email: -1 });

const User = mongoose.model("User", userSchema, "users");

module.exports = User;
