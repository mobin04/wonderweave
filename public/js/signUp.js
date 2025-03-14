/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

export const signUp = async (name, email, password, passwordConfirm) => {
  const signUpBtn = document.querySelector('.signup-btn');
  const spinner = document.querySelector('.spinner');

  // Show spinner and disable button
  spinner.classList.remove('hidden');
  signUpBtn.disabled = true;
  
  
  try {
    const res = await axios({
      method: 'POST',
      url: 'http://127.0.0.1:8000/api/v1/users/signup',
      data: {
        name,
        email,
        password,
        passwordConfirm,
      },
    });
    
    if (res.data.status === 'success') {
      showAlert(res.data.status, 'Verification mail successfully sent to your email');
      window.setTimeout(() => {
        location.assign(res.data.redirect);
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
