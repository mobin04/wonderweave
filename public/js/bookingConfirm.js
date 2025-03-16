/* eslint-disable */

import axios from 'axios';
import { showAlert } from './alerts';

export const bookingConfirm = async (tourId, selectedDate) => {
  try {
    const res = await axios({
      method: 'POST',
      url: 'http://127.0.0.1:8000/api/v1/bookings',
      data: {
        tourId,
        selectedDate,
      },
    });

    if (res.data.status === 'success') {
      showAlert(res.data.status, 'Booking Successful!');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
    
  } catch (err) {
    showAlert('error', err);
  }
};
