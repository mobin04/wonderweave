/*eslint-disable*/
import '@babel/polyfill';
import { displayMap } from './mapbox';
import { login, logout } from './login';
import { updateSettings } from './updateSettings';
import { signUp } from './signUp';
import { resendVerification } from './resendMail';
import {
  addGuideFunc,
  addLocationAndDateFunc,
  bookTourFunc,
  changeUserRoleFunc,
  confirmBookingFunc,
  createReviewFunc,
  createTourFunc,
  deleteFunc,
  deleteReviewFunc,
  removeGuideFunc,
  reviewSearchFunc,
  searchUserFunc,
  viewAllToursBtns,
} from './admin';

// DOM ELEMENTs
const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const logOutBtn = document.querySelector('.nav__el--logout');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-settings');
const signUpForm = document.querySelector('.form--signup');
const resendButton = document.querySelector('.resend-btn');
const bookBtn = document.querySelector('.tour-buy-button');
const bookingSuccessContainer = document.querySelector(
  '.booking-success-container',
);
const reviewSubmitForm = document.querySelector('.review-card-form');
const reviewDeleteBtn = document.querySelectorAll('.btn-delete');
const tourAdminContainer = document.querySelector('.tour-admin-container');
const adminTourDeleteBtn = document.querySelectorAll('.admin-tour-delete-btn');
const saveTourBtn = document.querySelector('.tour-admin-btn--submit');
const editTourBtn = document.getElementById('edit-tour--btn');
const addBtns = document.querySelector('.tour-admin-btn--add');
const searchInput = document.querySelector('.admin-users-search-input');
const deleteButton = document.getElementById('confirm-delete');
const changeRoleBtn = document.querySelectorAll('.admin-update-btn');
const addLeadGuideBtn = document.querySelectorAll('.add-lead-guide-btn');
const addGuideBtn = document.querySelectorAll('.add-guide-btn');
const leadGuideRemoveBtn = document.querySelectorAll('.lead-guide-remove-btn');
const guideRemoveBtn = document.querySelectorAll('.guide-remove-btn');
const reviewSearchInp = document.querySelector('.admin-reviews-search-input');
const deleteBtnReview = document.getElementById('confirm-delete-review');

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

// TOUR-BOOKING
if (bookBtn) bookTourFunc(bookBtn);

// BOOKING-CONFIRM
if (bookingSuccessContainer) confirmBookingFunc(bookingSuccessContainer);

// CREATE REVIEW
if (reviewSubmitForm) createReviewFunc(reviewSubmitForm);

// DELETE REVIEW
if (reviewDeleteBtn) deleteReviewFunc(reviewDeleteBtn);

// VIEW-ALL TOUR FUNCTIONALITY
if (tourAdminContainer) viewAllToursBtns();

// DELETE TOUR
if (adminTourDeleteBtn) {
  adminTourDeleteBtn.forEach((btn) => {
    deleteFunc(btn, 'tour');
  });
}

// ADD DATE AND ADD LOCAION AND REMOVE BUTTON FUNCTIONAL ON .
if (addBtns) addLocationAndDateFunc();

// GET THE INFORMATIONS FROM TOUR CREATE FORM AND CREATE TOUR.-------------------------------
[saveTourBtn, editTourBtn].forEach((btn, index) => {
  if (btn) createTourFunc(btn, index === 0 ? 'create' : 'edit');
});

// SEARCH-USER FUNCTIONALITY
if (searchInput) searchUserFunc(searchInput);

// DELETE USER IMPLEMENTATION
[deleteButton, deleteBtnReview].forEach((btn, index) => {
  if (btn) deleteFunc(btn, index === 0 ? 'user' : 'review');
});

// CHANGE USER ROLE IMPLEMENTATION
if (changeRoleBtn) changeUserRoleFunc(changeRoleBtn);

// ADD LEAD-GUIDE & REGULAR GUIDE IMPLEMENTATION
[addLeadGuideBtn, addGuideBtn].forEach((btn, index) => {
  if (btn) addGuideFunc(btn, index === 0 ? 'lead-guide' : 'guide');
});

// GUIDEs REMOVE IMPLEMENTATION
if (leadGuideRemoveBtn) removeGuideFunc(leadGuideRemoveBtn);
if (guideRemoveBtn) removeGuideFunc(guideRemoveBtn);

// REVIEW-SEARCH-FUNCTIONALITY
if (reviewSearchInp) reviewSearchFunc(reviewSearchInp);
