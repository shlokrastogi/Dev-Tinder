const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    lastName: { type: String, trim: true, minlength: 2, maxlength: 50 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Invalid email format");
        }
      },
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      maxlength: 128,
      trim: true,
      validate(value) {
        if (!validator.isStrongPassword(value)) {
          throw new Error(
            "Enter a stronger password (min 6 chars, with uppercase, lowercase, number, and symbol)",
          );
        }
      },
    },
    age: { type: Number, min: 18, max: 100, trim: true },
    gender: {
      type: String,
      enum: {
        values: ["male", "female", "other"],
        message: `{VALUE} is not a valid gender`,
      },
      trim: true,
      lowercase: true,

      // validate(value) {
      //   if (!["male", "female", "other"].includes(value.toLowerCase())) {
      //     throw new Error("Gender must be 'male', 'female', or 'other'");
      //   }
    },
    photoUrl: {
      type: String,
      default: "https://img.icons8.com/fluent/1200/user-male-circle.jpg",
      validate(value) {
        if (!validator.isURL(value)) {
          throw new Error("Invalid photo URL format");
        }
      },
    },
    about: {
      type: String,
      default: "Hey there! I'm using DevTinder.",
      maxlength: 500,
    },
    skills: { type: [String], default: [] },
  },
  { timestamps: true },
);

// Method to generate JWT token for the user
userSchema.methods.getJWT = async function () {
  const user = this;
  const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
  return token;
};

userSchema.methods.validatePassword = async function (passwordInputByUser) {
  const user = this;
  const hashedPassword = user.password;
  const isPasswordValid = await bcrypt.compare(
    passwordInputByUser,
    hashedPassword,
  );

  return isPasswordValid;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
