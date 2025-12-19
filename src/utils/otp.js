// Lib Imports.
import { generate } from 'otp-generator';

function generateOTP() {
  return generate(6, {
    digits: true,
    upperCaseAlphabets: true,
    specialChars: false,
    lowerCaseAlphabets: false,
  });
}

export { generateOTP };
