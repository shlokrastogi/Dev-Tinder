const express = require("express");
const { adminAuthMiddleware } = require("./middlewares/auth");
const connectDB = require("./config/database");
const User = require("./models/userSchema");

const app = express();

app.use(express.json());

// Middleware for the admin routes to check for authorization
app.use("/admin", adminAuthMiddleware);

app.post("/signup", async (req, res) => {
  const newUser = new User(req.body);
  try {
    const savedUser = await newUser.save();
    res
      .status(201)
      .json({ message: "User created successfully", user: savedUser });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating user", error: error.message });
  }
});

// Get user by email
app.get("/user", async (req, res) => {
  const emailId = req.body.email;
  try {
    const user = await User.findOne({ email: emailId });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).send(user);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching user", error: error.message });
  }
});

// Get the feed
app.get("/feed", async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).send(users);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching feed", error: error.message });
  }
});

connectDB()
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(3000, () => {
      console.log("Server is running on port 3000");
    });
  })
  .catch((error) => {
    console.error("Failed to connect to MongoDB:", error);
  });
