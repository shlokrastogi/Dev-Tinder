const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(
      //   "mongodb+srv://shlokrastogi2004_db_user:YJSQ4MKwnA7rjpJy@cluster0.cxsjuep.mongodb.net/devTinder",
      //   "mongodb://shlokrastogi2004_db_user:YJSQ4MKwnA7rjpJy@host1:27017,host2:27017,host3:27017/devTinder?ssl=true&replicaSet=atlas-xxxx-shard-0&authSource=admin&retryWrites=true&w=majority",
      //   "mongodb+srv://shlokrastogi2004_db_user:YJSQ4MKwnA7rjpJy@cluster0.cxsjuep.mongodb.net/?appName=Cluster0",
      "mongodb://shlokrastogi2004_db_user:YJSQ4MKwnA7rjpJy@ac-e96digm-shard-00-00.cxsjuep.mongodb.net:27017,ac-e96digm-shard-00-01.cxsjuep.mongodb.net:27017,ac-e96digm-shard-00-02.cxsjuep.mongodb.net:27017/devTinder?ssl=true&replicaSet=atlas-tfqxfn-shard-0&authSource=admin&appName=Cluster0",
      {
        family: 4,
      },
    );
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    throw error;
  }
};

module.exports = connectDB;
