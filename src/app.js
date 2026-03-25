const express = require("express");

const app = express();

app.get("/user", (req, res) => {
  res.json({ name: "John Doe", age: 30 });
});

app.post("/user", (req, res) => {
  res.json({ message: "User created successfully" });
});

app.patch("/user/:id", (req, res) => {
  res.json({ message: `User with id ${req.params.id} updated successfully` });
});

app.put("/user/:id", (req, res) => {
  res.json({ message: `User with id ${req.params.id} updated successfully` });
});

app.delete("/user/:id", (req, res) => {
  res.json({ message: `User with id ${req.params.id} deleted successfully` });
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
