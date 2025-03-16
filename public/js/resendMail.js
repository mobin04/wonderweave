/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

export const resendVerification = async (email) => {
  try {
    const res = await axios({
      method: 'POST',
      url: 'http://127.0.0.1:8000/api/v1/users/resend-verification',
      data: {
        email,
      },
    });

    if (res.data.status === 'success') {
      showAlert(
        res.data.status,
        'Verification mail send successfully! Please check your email.',
      );
      window.setTimeout(() => {
        location.assign(res.data.redirect);
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};