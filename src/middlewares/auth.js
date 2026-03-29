const adminAuthMiddleware = (req, res, next) => {
  const token = "xyz123";
  const isAdminAuthorized = token === "xyz123";
  if (!isAdminAuthorized) {
    return res.status(401).json({ message: "Unauthorized" });
  } else {
    next();
  }
};

module.exports = adminAuthMiddleware;
