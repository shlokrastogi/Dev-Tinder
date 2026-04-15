const express = require("express");
const { userAuth } = require("../middlewares/auth");
const ConnectionRequestModel = require("../models/connectionRequest");
const User = require("../models/userSchema");

const requestRouter = express.Router();

// Sending a connection request
requestRouter.post(
  "/request/send/:status/:toUserId",
  userAuth,
  async (req, res) => {
    try {
      const fromUserId = req.user._id;
      const toUserId = req.params.toUserId;
      const status = req.params.status;

      const allowedStatuses = ["ignored", "interested"];
      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          message: `Invalid status. Allowed values are: ${allowedStatuses.join(", ")}`,
        });
      }

      const toUser = await User.findById(toUserId);
      if (!toUser) {
        return res.status(404).json({ message: "Recipient user not found" });
      }

      //   // Prevent users from sending requests to themselves
      //   if (fromUserId.toString() === toUserId) {
      //     return res.status(400).json({
      //       message: "You cannot send request to yourself",
      //     });
      //   }

      // Check if a request already exists between the two users
      const existingRequest = await ConnectionRequestModel.findOne({
        $or: [
          { fromUserId, toUserId },
          { fromUserId: toUserId, toUserId: fromUserId },
        ],
      });

      if (existingRequest) {
        return res.status(400).json({
          message: "Connection request already exists",
        });
      }

      const connectionRequest = new ConnectionRequestModel({
        fromUserId,
        toUserId,
        status,
      });
      const data = await connectionRequest.save();
      res.status(201).json({
        message: "Connection request sent successfully",
        data,
      });
    } catch (error) {
      console.error("Error sending connection request:", error);
      res.status(500).send("Error sending connection request");
    }
  },
);

// Accepting or rejecting a connection request
requestRouter.post(
  "/request/review/:status/:requestId",
  userAuth,
  async (req, res) => {
    try {
      const loggedInUser = req.user;
      const { status, requestId } = req.params;

      const allowedStatuses = ["accepted", "rejected"];
      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          message: `Invalid status. Allowed values are: ${allowedStatuses.join(", ")}`,
        });
      }

      // Validate the status
      // logedIn._id = toUserId in the request model
      // status = interested
      // requestId shold be valid
      const connectionRequest = await ConnectionRequestModel.findOne({
        _id: requestId,
        toUserId: loggedInUser._id,
        status: "interested",
      });
      console.log("Connection Request Found:", connectionRequest);

      if (!connectionRequest) {
        return res.status(404).json({
          message: "Connection request not found or already reviewed",
        });
      }

      connectionRequest.status = status;
      const data = await connectionRequest.save();

      res.status(200).json({
        message: `Connection request ${status} successfully`,
        data,
      });
    } catch (error) {
      console.error("Error reviewing connection request:", error);
      res.status(500).send("Error reviewing connection request");
    }
  },
);

module.exports = requestRouter;
