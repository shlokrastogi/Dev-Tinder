const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../models/userSchema");
const { signupValidation } = require("../utils/validate");

const authRouter = express.Router();

// Register a new user
authRouter.post("/signup", async (req, res) => {
  try {
    // Step 1: Validate
    const validationResult = signupValidation(req);
    if (!validationResult.valid) {
      return res.status(400).json({ message: validationResult.message });
    }

    const { email, password } = req.body;

    // Step 2: Check duplicate
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Step 3: Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    req.body.password = hashedPassword;

    // Step 4: Save user
    const newUser = new User(req.body);
    const savedUser = await newUser.save();

    // ✅ FIX: use savedUser (not user)
    const token = await savedUser.getJWT();

    const userObj = savedUser.toObject();
    delete userObj.password;

    // ✅ Single response only
    res
      .cookie("token", token, {
        httpOnly: true,
        sameSite: "lax",
        secure: false,
      })
      .status(201)
      .json({
        message: "User created successfully",
        user: userObj,
      });
  } catch (error) {
    console.log("SIGNUP ERROR:", error);

    if (error.code === 11000) {
      return res.status(400).json({ message: "Email already exists" });
    }

    res.status(500).json({
      message: "Error creating user",
      error: error.message,
    });
  }
});

// Login a user
authRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = await user.getJWT();

    const userObj = user.toObject();
    delete userObj.password;

    res
      .cookie("token", token, {
        httpOnly: true,
        sameSite: "lax",
        secure: false,
      })
      .status(200)
      .json({ message: "Login successful", user: userObj });
  } catch (error) {
    res.status(500).json({
      message: "Login failed",
      error: error.message,
    });
  }
});

//Logout a user
authRouter.post("/logout", (req, res) => {
  res.clearCookie("token").send("Logout successful");
});

module.exports = authRouter;
