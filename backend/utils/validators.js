const { body, validationResult } = require('express-validator');
const constants = require('../src/config/constants');

const { VALIDATION, ACCOUNT } = constants;
const { USERNAME, NAME, PASSWORD, PHONE } = VALIDATION;

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

const registerValidation = [
  body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),

  body('username')
    .trim()
    .isLength({ min: USERNAME.MIN_LENGTH, max: USERNAME.MAX_LENGTH })
    .matches(USERNAME.PATTERN)
    .withMessage(`Username must be ${USERNAME.MIN_LENGTH}-${USERNAME.MAX_LENGTH} characters, alphanumeric, underscore, or hyphen`),

  body('password')
    .isLength({ min: PASSWORD.MIN_LENGTH, max: PASSWORD.MAX_LENGTH })
    .withMessage(`Password must be at least ${PASSWORD.MIN_LENGTH} characters`),

  body('first_name')
    .trim()
    .isLength({ min: NAME.MIN_LENGTH, max: NAME.MAX_LENGTH })
    .matches(NAME.PATTERN)
    .withMessage(`First name must be ${NAME.MIN_LENGTH}-${NAME.MAX_LENGTH} characters, letters only`),

  body('last_name')
    .optional()
    .trim()
    .isLength({ max: NAME.MAX_LENGTH })
    .matches(/^[a-zA-Z\s]*$/)
    .withMessage('Last name must be letters only'),

  body('phone_number')
    .optional()
    .trim()
    .matches(PHONE.PATTERN)
    .withMessage('Valid phone number required'),

  validate
];

const loginValidation = [
  body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),

  body('password')
    .notEmpty()
    .withMessage('Password is required'),

  validate
];

const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),

  body('newPassword')
    .isLength({ min: PASSWORD.MIN_LENGTH, max: PASSWORD.MAX_LENGTH })
    .withMessage(`New password must be at least ${PASSWORD.MIN_LENGTH} characters`),

  validate
];

const refreshValidation = [
  body('refreshToken')
    .notEmpty()
    .withMessage('Refresh token is required'),

  validate
];

module.exports = {
  registerValidation,
  loginValidation,
  changePasswordValidation,
  refreshValidation,
  validate
};
