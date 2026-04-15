const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../models/userSchema");
const { signupValidation } = require("../utils/validate");

const authRouter = express.Router();

// Register a new user
authRouter.post("/signup", async (req, res) => {
  try {
    // Step 1: Validate first
    const validationResult = signupValidation(req);
    if (validationResult) {
      return res.status(400).json(validationResult);
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

    res.status(201).json({
      message: "User created successfully",
      user: savedUser,
    });
  } catch (error) {
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
  const { email, password } = req.body;

  // Check if the user with the provided email exists
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ message: "Invalid email or password" });
  }

  // Check if the provided password matches the hashed password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(400).json({ message: "Invalid email or password" });
  }

  // Get a JWT token for the user
  const token = await user.getJWT();

  // Add the token to the cookie and send back to the user
  res
    .cookie("token", token, { httpOnly: true })
    .status(200)
    .json({ message: "Login successful", user });
});

//Logout a user
authRouter.post("/logout", (req, res) => {
  res.clearCookie("token").send("Logout successful");
});

module.exports = authRouter;
