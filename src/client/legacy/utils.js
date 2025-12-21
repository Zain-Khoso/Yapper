'use strict';

function formatDateString(date) {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function isSameDate(one, two) {
  if (!one || !two) return false;

  if (
    one.getFullYear() === two.getFullYear() &&
    one.getMonth() === two.getMonth() &&
    one.getDate() === two.getDate()
  )
    return true;
  else return false;
}
