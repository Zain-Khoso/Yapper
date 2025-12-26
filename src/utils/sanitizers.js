// Lib Imports.
import validator from 'validator';
import he from 'he';

function sanitizeEmail(email) {
  email = validator.trim(email);
  email = validator.normalizeEmail(email.trim(), {
    gmail_remove_dots: false,
    gmail_remove_subaddress: false,
    outlookdotcom_remove_subaddress: false,
    yahoo_remove_subaddress: false,
    icloud_remove_subaddress: false,
  });

  return email;
}

function sanitizeText(text) {
  return typeof text === 'string' ? he.encode(text.trim()) : text;
}

export { sanitizeEmail, sanitizeText };
