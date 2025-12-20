// Lib Imports.
import validator from 'validator';
import he from 'he';

function sanitizeEmail(email) {
  return validator.normalizeEmail(email.trim(), {
    gmail_remove_dots: false,
    gmail_remove_subaddress: false,
    outlookdotcom_remove_subaddress: false,
    yahoo_remove_subaddress: false,
    icloud_remove_subaddress: false,
  });
}

function sanitizeText(text) {
  return typeof text === 'string' ? he.encode(text.trim(), { allowUnsafeSymbols: true }) : text;
}

export { sanitizeEmail, sanitizeText };
