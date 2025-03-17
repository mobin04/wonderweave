/*eslint-disable*/
import '@babel/polyfill';
import { displayMap } from './mapbox';
import { login, logout } from './login';
import { updateSettings } from './updateSettings';
import { bookTour } from './stripe';
import { signUp } from './signUp';
import { resendVerification } from './resendMail';
import { bookingConfirm } from './bookingConfirm';
import { manageReview } from './manageReview';

// DOM ELEMENTs
const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const logOutBtn = document.querySelector('.nav__el--logout');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-settings');
// const bookBtn = document.getElementById('book-tour');
const signUpForm = document.querySelector('.form--signup');
const resendButton = document.querySelector('.resend-btn');
const bookBtn = document.querySelector('.tour-buy-button');
const bookingSuccessContainer = document.querySelector(
  '.booking-success-container',
);
const reviewSubmitForm = document.querySelector('.review-card-form');

// MAP BOX
if (mapBox) {
  const locations = JSON.parse(mapBox.dataset.locations);
  displayMap(locations);
}

// LOGIN FORM
if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });
}

if (logOutBtn) logOutBtn.addEventListener('click', logout);

// UPDATE USER DATA.
if (userDataForm) {
  userDataForm.addEventListener('submit', (e) => {
    e.preventDefault(); // prevents the browser from reloading the page or submit the form
    // Same names as api expect
    const form = new FormData(); // Collect form details automatically.
    form.append('name', document.getElementById('name').value); //.append() add key-value pairs to form
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]); //files are array and select the first file
    updateSettings(form, 'data');
  });
}

// UPDATE USER PASSWORD
if (userPasswordForm) {
  userPasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Same names as api expect
    document.querySelector('.btn-save-password').innerHTML = 'Updating...';
    const passwordCurrent = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;

    await updateSettings(
      { passwordCurrent, password, passwordConfirm },
      'password',
    );
    document.querySelector('.btn-save-password').innerHTML = 'Updated';
    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
  });
}

// if (bookBtn) {    *****************************************
//   bookBtn.addEventListener('click', (e) => {
//     e.target.textContent = 'Processing...';
//     const { tourId } = e.target.dataset;
//     bookTour(tourId);
//   });
// }

if (signUpForm) {
  signUpForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('passwordConfirm').value;

    await signUp(name, email, password, passwordConfirm);

    document.getElementById('name').innerText = '';
    document.getElementById('email').innerText = '';
  });
}

if (resendButton) {
  resendButton.addEventListener('click', async (e) => {
    e.preventDefault();

    const email = resendButton.getAttribute('data-email'); // Get email from data attribute
    if (!email) {
      console.error('Email not found in dataset!');
      return;
    }

    await resendVerification(email);
  });
}

if (bookBtn) {
  bookBtn.addEventListener('click', (e) => {
    e.preventDefault();

    const tourId = bookBtn.getAttribute('data-tourId');

    const selectedDate = document.querySelector(
      'input[name="date"]:checked',
    ).value;

    bookTour(tourId, selectedDate);
  });
}

if (bookingSuccessContainer) {
  const tourData = JSON.parse(
    bookingSuccessContainer.getAttribute('data-tour'),
  );

  const id = tourData.id;
  const selectedDate = tourData.selectedDate;

  bookingConfirm(id, selectedDate);
}

if (reviewSubmitForm) {
  reviewSubmitForm.addEventListener('submit', async(e) => {
    e.preventDefault();
    const reviewId = document.querySelector('.review-card-submit').getAttribute('data-reviewId');
    
    const type = window.location.pathname.split('/')[1];
    const tourId = document.querySelector('.review-card-form').getAttribute('data-tourId');
    
    const review = document.querySelector('.review-card-textarea').value;
    const selectedRating = document.querySelector('input[name="rating"]:checked').value;

    await manageReview(type, reviewId, tourId, selectedRating, review)

  });
}
