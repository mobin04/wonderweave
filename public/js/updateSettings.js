/* eslint-disable */
// IMPLEMENT UPDATE USER DATA
import axios from 'axios';
import { showAlert } from './alerts';

// Type is either password or data
export const updateSettings = async (data, type) => {
  try {
    const url =
      type === 'password'
        ? 'http://127.0.0.1:8000/api/v1/users/updateMyPassword'
        : 'http://127.0.0.1:8000/api/v1/users/updateMe';

    const res = await axios({
      method: 'PATCH',
      url,
      data: data,
    });
    if (res.data.status === 'success') {
      showAlert(res.data.status, `${type.toUpperCase()} Updated Successfully!`);
      window.setTimeout(() => {
        location.assign('/me'); // Navigates to /me
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
