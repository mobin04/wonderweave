/*eslint-disable*/
import '@babel/polyfill';
import { displayMap } from './mapbox';
import { login, logout } from './login';
import { updateSettings } from './updateSettings';

// DOM ELEMENTs
const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const logOutBtn = document.querySelector('.nav__el--logout');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-settings');


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
    console.log(form);
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
