const express = require("express");
const { adminAuthMiddleware } = require("./middlewares/auth");

const app = express();

// Middleware for the admin routes to check for authorization
app.use("/admin", adminAuthMiddleware);

app.get("/admin/getAllUsers", (req, res) => {
  try {
    // logic
    res.json({ message: "All users retrieved successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Something broke!");
  }
});

app.delete("/admin/deleteUser/:id", (req, res) => {
  const userId = req.params.id;
  try {
    // logic
    res.json({ message: `User with ID ${userId} has been deleted` });
  } catch (error) {
    console.error(error);
    res.status(500).send("Something broke!");
  }
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
