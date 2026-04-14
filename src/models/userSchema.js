const mongoose = require("mongoose");

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
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      maxlength: 128,
      trim: true,
    },
    age: { type: Number, min: 18, max: 100, trim: true },
    gender: {
      type: String,
      validate(value) {
        if (!["male", "female", "other"].includes(value.toLowerCase())) {
          throw new Error("Gender must be 'male', 'female', or 'other'");
        }
      },
    },
    photoUrl: {
      type: String,
      default: "https://www.freepik.com/free-photos-vectors/user-profile",
    },
    About: {
      type: String,
      default: "Hey there! I'm using DevTinder.",
      maxlength: 500,
    },
    skills: { type: [String], default: [] },
  },
  { timestamps: true },
);

const User = mongoose.model("User", userSchema);

module.exports = User;
