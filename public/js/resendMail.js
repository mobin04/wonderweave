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

// export const resendVerification = async function (email) {
//   try {
//     const res = await axios.post('/api/v1/auth/resend-verification', { email });

//     if (res.data.status === 'success') {
//       alert('Verification email sent!');
//       window.location.href = `/email-verify?email=${email}`;
//     }
//   } catch (err) {
//     console.error(err);
//     alert(err.response?.data?.message || "Error resending verification email!");
//   }
// }
