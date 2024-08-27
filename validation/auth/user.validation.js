const { body } = require("express-validator");
const { AvailableRoles } = require("../../constants");

const passwordReg = /^(?=.*[a-z])(?=.*[A-Z]*)(?=.*\d)(?=.*[-.+@_&]).{8,20}$/;

const registerValidator = () => [
  body("username").trim().notEmpty().withMessage("username is required"),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("email is required")
    .isEmail()
    .normalizeEmail()
    .withMessage("must be a valid email format"),
  body("password").trim().notEmpty().withMessage("password is required"),
  // .matches(passwordReg)
  // .withMessage(
  //   "password must be at least 6 long in length and it is expected to contain digits, letter",
  // ),
  body("role").optional().trim().isIn(AvailableRoles).withMessage("Invalid user role"),
];

const loginValidator = () => [
  body("username").trim().optional().notEmpty(),
  body("email")
    .trim()
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage("must be a valid email format"),
  body("password")
    .trim()
    .notEmpty()
    .withMessage("password is required")
    // .matches(passwordReg)
    // .withMessage(
    //   "password must be at least 6 long in length and it is expected to contain digits, letter",
    // ),
];

module.exports = { registerValidator, loginValidator };
