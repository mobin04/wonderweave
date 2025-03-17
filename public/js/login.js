/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

export const login = async (email, password) => {
  const loginBtn = document.querySelector('.login-btn');
  const spinner = document.querySelector('.spinner');

  // Show spinner and disable button
  spinner.classList.remove('hidden');
  loginBtn.disabled = true;

  try {
    const res = await axios({
      method: 'POST',
      url: 'http://127.0.0.1:8000/api/v1/users/login',
      data: {
        email,
        password,
      },
    });

    if (res.data.status === 'success') {
      showAlert(res.data.status, 'Logged in successfully!');
      window.setTimeout(() => {
        location.assign('/');
      }, 1200);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  } finally {
    // Hide spinner and enable button again
    spinner.classList.add('hidden');
    loginBtn.disabled = false;
  }
};

export const logout = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: 'http://127.0.0.1:8000/api/v1/users/logout',
    });
    // set up reload the page, which will send the invalid cookie to the server
    if (res.data.status === 'success') location.reload(true); // it will force reload the server not from browser cache.
  } catch (err) {
    alert('something went wrong ');
    // showAlert('error', err.response.data.message);
  }
};
