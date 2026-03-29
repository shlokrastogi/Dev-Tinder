const express = require("express");
const { adminAuth } = require("./middlewares/auth");

const app = express();

// Middleware for the admin routes to check for authorization
app.use("/admin", adminAuth);

app.get("/admin/getAllUsers", (req, res) => {
  res.send("List of all users");
});

app.delete("/admin/deleteUser/:id", (req, res) => {
  const userId = req.params.id;
  res.send(`User with ID ${userId} has been deleted`);
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
