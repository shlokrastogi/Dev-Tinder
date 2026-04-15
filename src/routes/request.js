const express = require("express");
const { userAuth } = require("../middlewares/auth");

const requestRouter = express();

// Sending a connection request
requestRouter.post("/request", userAuth, async (req, res) => {
  const user = req.user;

  console.log("Sending a connection request");

  res.send(user.firstName + " " + user.lastName + " sent a connection request");
});

module.exports = requestRouter;
