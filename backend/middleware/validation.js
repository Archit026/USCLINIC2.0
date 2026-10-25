/**
 * SECURITY FIX #6: Input Validation Middleware
 * Prevents injection attacks and invalid data
 */
const { body, validationResult, param, query } = require('express-validator');

/**
 * Validation error handler middleware
 * Use this after validation to return errors if any
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg,
      })),
    });
  }
  next();
};

/**
 * Authentication validation rules
 */
const validateSignup = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2-100 characters'),
  
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/(?=.*[A-Z])(?=.*[a-z])(?=.*\d)/)
    .withMessage('Password must contain uppercase, lowercase, and numbers'),
  
  body('role')
    .isIn(['patient', 'doctor'])
    .withMessage('Role must be either patient or doctor'),
];

const validateLogin = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  body('role')
    .isIn(['patient', 'doctor'])
    .withMessage('Role must be either patient or doctor'),
];

/**
 * Appointment validation rules
 */
const validateCreateAppointment = [
  body('patientId')
    .trim()
    .isMongoId()
    .withMessage('Invalid patient ID'),
  
  body('doctorId')
    .trim()
    .isMongoId()
    .withMessage('Invalid doctor ID'),
  
  body('time')
    .isISO8601()
    .withMessage('Invalid date/time format')
    .custom(value => {
      if (new Date(value) <= new Date()) {
        throw new Error('Appointment time must be in the future');
      }
      return true;
    }),
  
  body('reason')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Reason must be less than 500 characters'),
];

/**
 * User ID validation
 */
const validateUserId = [
  param('id')
    .trim()
    .isMongoId()
    .withMessage('Invalid user ID'),
];

const validateAppointmentId = [
  param('appointmentId')
    .trim()
    .isMongoId()
    .withMessage('Invalid appointment ID'),
];

module.exports = {
  handleValidationErrors,
  validateSignup,
  validateLogin,
  validateCreateAppointment,
  validateUserId,
  validateAppointmentId,
};
