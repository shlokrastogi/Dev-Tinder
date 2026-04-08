const express = require("express");
const { adminAuthMiddleware } = require("./middlewares/auth");
const connectDB = require("./config/database");
const User = require("./models/userSchema");

const app = express();

app.use(express.json());

// Middleware for the admin routes to check for authorization
app.use("/admin", adminAuthMiddleware);

app.post("/signup", async (req, res) => {
  // Handle user signup logic here
  const newUser = new User({
    firstName: "Shlok",
    lastName: "Rastogi",
    email: "shlok@gmail.com",
    password: "password123",
    age: 20,
    gender: "Male",
  });

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
