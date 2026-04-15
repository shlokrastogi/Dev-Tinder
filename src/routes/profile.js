const express = require("express");
const { userAuth } = require("../middlewares/auth");
const User = require("../models/userSchema");
const {
  isValidProfileUpdate,
  isValidPasswordUpdate,
} = require("../utils/validate");
const bcrypt = require("bcrypt");

const profileRouter = express();

// Get user's profile
profileRouter.get("/profile/view", userAuth, async (req, res) => {
  try {
    const user = req.user;
    res.status(200).json({ user });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching profile", error: error.message });
  }
});

// Update user's profile
profileRouter.patch("/profile/update", userAuth, async (req, res) => {
  try {
    if (!isValidProfileUpdate(req)) {
      return res.status(400).json({ message: "Invalid profile update" });
    }

    const loggedInUser = req.user;

    Object.keys(req.body).forEach((key) => {
      loggedInUser[key] = req.body[key];
    });

    await loggedInUser.save();

    res
      .status(200)
      .json({ message: "Profile updated successfully", user: loggedInUser });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating profile", error: error.message });
  }
});

// Update/ Change the password
profileRouter.patch("/profile/password", userAuth, async (req, res) => {
  try {
    const { password } = req.body;

    const passwordValidation = isValidPasswordUpdate(req);
    if (!passwordValidation.valid) {
      return res.status(400).json({ message: passwordValidation.message });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const loggedInUser = req.user;
    loggedInUser.password = hashedPassword;

    await loggedInUser.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Error updating password",
      error: error.message,
    });
  }
});

module.exports = profileRouter;
