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

// Delete a user by Id
app.delete("/user/:id", async (req, res) => {
  const userId = req.params.id;

  try {
    // Validate ID format
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const deletedUser = await User.findByIdAndDelete(userId);

    // If user not found
    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Successfully deleted
    res.status(200).json({
      message: "User deleted successfully",
      user: deletedUser,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting user",
      error: error.message,
    });
  }
});

// Update a user by Id
app.patch("/user/:userId", async (req, res) => {
  const userId = req.params?.userId;
  const data = req.body;

  const ALLOWED_UPDATES = [
    "firstName",
    "lastName",
    "password",
    "age",
    "gender",
    "photoUrl",
    "About",
    "skills",
  ];
  const isUpdateAllowed = Object.keys(data).every((k) => {
    ALLOWED_UPDATES.includes(k);
  });
  if (!isUpdateAllowed) {
    return res.status(400).json({ message: "Invalid updates" });
  }
  if (data?.skills.length > 20) {
    throw new Error("Cannot have more than 20 skills");
  }

  try {
    // Validate ID format
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }
    const updatedUser = await User.findByIdAndUpdate(userId, req.body, {
      new: true,
      runValidators: true,
    });

    // If user not found
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res
      .status(200)
      .json({ message: "User updated successfully", user: updatedUser });
  } catch (error) {
    res.status(500).json({
      message: "Error updating user",
      error: error.message,
    });
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
