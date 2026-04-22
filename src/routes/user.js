const express = require("express");
const { userAuth } = require("../middlewares/auth");
const User = require("../models/userSchema");
const USER_SAFE_FIELDS =
  "firstName lastName email photoUrl age gender about skills";
const ConnectionRequestModel = require("../models/connectionRequest");

const userRouter = express.Router();

// Get all the pending connections fronm the logged in user
userRouter.get("/user/requests/recieved", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const connectionRequests = await ConnectionRequestModel.find({
      toUserId: loggedInUser._id,
      status: "interested",
    }).populate("fromUserId", USER_SAFE_FIELDS.join(" "));
    //.populate("toUserId", ["firstName", "lastName", "email", "photoUrl"]);
    res.status(200).json({
      message: "Connection requests fetched successfully",
      connectionRequests,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching connection requests",
      error: error.message,
    });
  }
});

// Get all the connections of the logged in user
userRouter.get("/user/connections", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const connections = await ConnectionRequestModel.find({
      $or: [
        { fromUserId: loggedInUser._id, status: "accepted" },
        { toUserId: loggedInUser._id, status: "accepted" },
      ],
    })
      .populate("fromUserId", USER_SAFE_FIELDS)
      .populate("toUserId", USER_SAFE_FIELDS.join);
    //.populate("toUserId", ["firstName", "lastName", "email", "photoUrl"]);

    const data = connections.map((row) => {
      if (row.fromUserId._id.toString() === loggedInUser._id.toString()) {
        return row.toUserId;
      }
      return row.fromUserId;
    });
    res.status(200).json({
      message: "Connections fetched successfully",
      data,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching connections",
      error: error.message,
    });
  }
});

// Get the feed of users for the logged in user
userRouter.get("/user/feed", userAuth, async (req, res) => {
  // User see all the except
  //1. himself
  //2. users with whom he has sent a connection request (both accepted and pending)
  //3. users who have sent him a connection request (both accepted and pending)
  //4. users with whom he has rejected connection request (both sent and recieved)

  try {
    const loggedInUser = req.user;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    limit = Math.min(limit, 50); 

    // Find all connections accept or recieved by the logged in user
    const connectionRequests = await ConnectionRequestModel.find({
      $or: [{ fromUserId: loggedInUser._id }, { toUserId: loggedInUser._id }],
    }).select("fromUserId toUserId");

    const excludedUserIds = new Set();
    connectionRequests.forEach((request) => {
      excludedUserIds.add(request.fromUserId.toString());
      excludedUserIds.add(request.toUserId.toString());
    });

    const feedUsers = await User.find({
      $and: [
        { _id: { $nin: Array.from(excludedUserIds) } },
        { _id: { $ne: loggedInUser._id } },
      ],
    })
      .select(USER_SAFE_FIELDS)
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      message: "Feed fetched successfully",
      feed: feedUsers,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching feed",
      error: error.message,
    });
  }
});

module.exports = { userRouter };
