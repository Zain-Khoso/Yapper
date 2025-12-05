// Lib Imports.
const { z } = require('zod');
const validator = require('validator');

// Field Schemas.
const schema_email = z
  .email({ error: 'The email you have provided is not valid.' })
  .min(1, { error: 'Email is required.' });

const schema_displayName = z
  .string()
  .trim()
  .min(3, { error: 'Display Name cannot be of less than 3 characters.' })
  .max(16, { error: 'Display Name cannot be of more than 16 characters.' });

const schema_password = z
  .string()
  .trim()
  .min(1, { error: 'Password is required.' })
  .refine((password) => validator.isStrongPassword(password), {
    error:
      'Password must be 8 characters long with a lowercase, an uppercase, a number and a symbol characters.',
  });

module.exports = { schema_email, schema_displayName, schema_password };
