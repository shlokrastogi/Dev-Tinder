const express = require("express");
const { userAuth } = require("../middlewares/auth");
const User = require("../models/userSchema");
const {
  isValidProfileUpdate,
  isValidPasswordUpdate,
} = require("../utils/validate");
const bcrypt = require("bcrypt");

const profileRouter = express.Router();

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
    const updates = { ...req.body };

    // 🔥 Normalize data

    // skills → array
    if (updates.skills && typeof updates.skills === "string") {
      updates.skills = updates.skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }

    // gender → lowercase
    if (updates.gender) {
      if (req.body.gender === "") {
        req.body.gender = null;
      } else {
        updates.gender = updates.gender.toLowerCase();
      }
    }

    // age → number
    if (updates.age) {
      updates.age = Number(updates.age);
    }

    // photoUrl → remove empty string
    if (updates.photoUrl === "") {
      updates.photoUrl = undefined;
    }

    // Apply updates safely
    Object.keys(updates).forEach((key) => {
      loggedInUser[key] = updates[key];
    });

    await loggedInUser.save();

    res.status(200).json({
      message: "Profile updated successfully",
      user: loggedInUser,
    });
  } catch (error) {
    console.log("PROFILE UPDATE ERROR:", error); // 👈 MUST SEE THIS

    res.status(500).json({
      message: "Error updating profile",
      error: error.message,
    });
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
    console.log("PROFILE UPDATE ERROR FULL:", error);
    console.log("ERROR MESSAGE:", error.message);
    console.log("ERROR NAME:", error.name);

    res.status(500).json({
      message: "Error updating password",
      error: error.message,
    });
  }
});

module.exports = profileRouter;
