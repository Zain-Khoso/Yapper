// Lib Imports.
import { z } from 'zod';
import validator from 'validator';

// Constants.
const ALLOWED_PICTURE_FILE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'application/pdf', 'text/plain'];
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2mb

// Field Schemas.
const schema_Email = z.email('The email you have provided is not valid.');

const schema_OTP = z.string().min(6, 'Invaid OTP').max(6, 'Invalid OTP');

const schema_PictureFile = z
  .file('Invalid File')
  .mime(ALLOWED_PICTURE_FILE_TYPES, 'Only .jpg, .jpeg, .png and .webp formats are supported.')
  .max(MAX_FILE_SIZE, 'Max image size is 2MB.')
  .refine((file) => file.name.length <= 32, 'File name is too big.')
  .optional()
  .or(z.literal(null));

const schema_PictureObject = z
  .object({
    name: z.string().max(32, 'File name is too big.'),
    type: z.string().refine((val) => ALLOWED_PICTURE_FILE_TYPES.includes(val)),
    size: z.number().max(MAX_FILE_SIZE),
  })
  .optional()
  .or(z.literal(null));

const schema_DisplayName = z
  .string()
  .trim()
  .min(1, 'Display Name is required.')
  .min(3, 'Cannot be less than 3 characters.')
  .max(16, 'Cannot be more than 16 characters.');

const schema_Password = z
  .string()
  .trim()
  .min(1, 'Password is required.')
  .max(50, 'Password is too long')
  .refine(
    (password) => validator.isStrongPassword(password),
    'Must be atleast 8 characters long with a lowercase, an uppercase, a number and a symbol characters.'
  );

const schema_ConfirmPassword = z
  .object({
    password: schema_Password,
    confirmPassword: z.string(),
  })
  .refine((data) => data.confirmPassword === data.password, {
    error: 'Passowrds do not match.',
  });

const schema_Checkbox = z.boolean('You must our these Terms and Conditions');

const schema_URL = z.url('Invalid URL').optional().or(z.literal(null));

// Function to get the first error message of any given schema.
function getZodError(result) {
  if (result.success) return '';

  const { errors } = z.treeifyError(result.error);

  return errors.at(0);
}

export {
  schema_Email,
  schema_OTP,
  schema_PictureFile,
  schema_PictureObject,
  schema_DisplayName,
  schema_Password,
  schema_ConfirmPassword,
  schema_Checkbox,
  schema_URL,
  getZodError,
};
