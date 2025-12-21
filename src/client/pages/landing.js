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
import '../js/user';

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

// Initialize button states
updateCarousel();
