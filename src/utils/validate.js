const validator = require("validator");

const signupValidation = (req) => {
  const { firstName, lastName, email, password } = req.body;
  if (!firstName || !email || !password) {
    return {
      valid: false,
      message: "First name, email, and password are required",
    };
  }
  if (!validator.isEmail(email)) {
    return { valid: false, message: "Invalid email format" };
  }
  if (!validator.isStrongPassword(password)) {
    return { valid: false, message: "Please enter a strong password" };
  }
};

const isValidProfileUpdate = (req) => {
  const allowedUpdates = [
    "firstName",
    "lastName",
    "age",
    "gender",
    "about",
    "skills",
    "photoUrl",
  ];

  const isEditAllowed = Object.keys(req.body).every((field) => {
    return allowedUpdates.includes(field);
  });

  return isEditAllowed;
};

// Password update validation
const isValidPasswordUpdate = (req) => {
  const { password } = req.body;
  if (!password) {
    return { valid: false, message: "Password is required" };
  }
  if (!validator.isStrongPassword(password)) {
    return { valid: false, message: "Please enter a strong password" };
  }
  return { valid: true };
};

module.exports = {
  signupValidation,
  isValidProfileUpdate,
  isValidPasswordUpdate,
};
