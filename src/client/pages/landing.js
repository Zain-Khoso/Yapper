'use strict';

// Page Styles.
import '../css/utils/index.css';
import '../css/utils/static.css';
import '../css/components/svg.css';
import '../css/components/button.css';
import '../css/components/navbar.css';
import '../css/components/footer.css';
import '../css/landing.css';

// Page Scripts.
import '../js/theme';
import { loadCurrentUser } from '../js/user';
import { API, showError } from '../js/utils';

// CAROUSEL SETUP.

const carousel = document.querySelector('.carousel');
const slidesContainer = carousel.querySelector('.slides');
const slides = carousel.querySelectorAll('.slide');
const prevBtn = carousel.querySelector('.control:first-child');
const nextBtn = carousel.querySelector('.control:last-child');

let currentIndex = 0;

// Calculate how many slides can fit in the view at once
const getVisibleSlides = () => {
  const containerWidth = slidesContainer.offsetWidth;
  const slideWidth = slides[0].offsetWidth;
  return Math.floor(containerWidth / slideWidth) || 1;
};

const updateCarousel = () => {
  const slideWidth = slides[0].offsetWidth;
  const gap = 24; // 1.5rem = 24px (assuming 16px root)

  // Calculate movement
  const moveDistance = currentIndex * (slideWidth + gap);

  slidesContainer.scrollTo({
    left: moveDistance,
    behavior: 'smooth',
  });

  // Optional: Disable buttons at boundaries
  prevBtn.style.opacity = currentIndex === 0 ? '0.5' : '1';
  prevBtn.style.pointerEvents = currentIndex === 0 ? 'none' : 'all';

  const maxIndex = slides.length - getVisibleSlides();
  nextBtn.style.opacity = currentIndex >= maxIndex ? '0.5' : '1';
  nextBtn.style.pointerEvents = currentIndex >= maxIndex ? 'none' : 'all';
};

nextBtn.addEventListener('click', () => {
  const maxIndex = slides.length - getVisibleSlides();
  if (currentIndex < maxIndex) {
    currentIndex++;
    updateCarousel();
  }
});

prevBtn.addEventListener('click', () => {
  if (currentIndex > 0) {
    currentIndex--;
    updateCarousel();
  }
});

updateCarousel();

// PAYMENTS SETUP.
const elem_GoldButton = document.getElementById('checkout-gold');
const elem_SilverButton = document.getElementById('checkout-silver');

async function handleCheckout(_) {
  if (!window?.currentUser) {
    const params = new URLSearchParams();
    params.set('redirect_to', '/#pricing');

    return location.assign(`/login?${params.toString()}`);
  }

  try {
    const {
      data: {
        data: { url },
      },
    } = await API.post('/payment/checkout', {
      success_url: 'http://localhost:8000/payment-success',
      cancel_url: 'http://localhost:8000/payment-cancel',
    });

    location.assign(url);
  } catch (error) {
    new showError('Something went wrong.');
  }
}

elem_GoldButton.addEventListener('click', handleCheckout);

// Paywall.
loadCurrentUser(() => {
  const user = window.currentUser;
  if (!user) return;

  if (user.get('plan') === 'gold') {
    elem_GoldButton.textContent = "You're already Golden";
    elem_GoldButton.classList.replace('primary', 'outline');
    elem_GoldButton.setAttribute('style', 'pointer-events: none;');
    elem_GoldButton.removeEventListener('click', handleCheckout);

    elem_SilverButton.textContent = 'Continue Your Chats';
    elem_SilverButton.classList.replace('outline', 'primary');
  }
});
