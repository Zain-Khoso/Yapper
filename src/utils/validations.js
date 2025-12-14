// Lib Imports.
const { z } = require('zod');
const validator = require('validator');

// Constants.
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'application/pdf', 'text/plain'];
const MAX_FILE_SIZE = 2 * 1024 * 1024;

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

const schema_file = z.object({
  type: z.string().refine((type) => ALLOWED_FILE_TYPES.includes(type), { message: 'Invalid File' }),
  size: z.number().max(MAX_FILE_SIZE, { message: 'Invalid File' }),
});

module.exports = {
  schema_email,
  schema_displayName,
  schema_password,
  schema_file,
};
