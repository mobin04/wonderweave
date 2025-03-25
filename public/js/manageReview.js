/* eslint-disable */

import axios from 'axios';
import { showAlert } from './alerts';

export const manageReview = async (type, reviewId, tourId, rating, review) => {
  try {
    const method = type === 'add-review' ? 'POST' : 'PATCH';

    const url =
      type === 'add-review'
        ? `http://127.0.0.1:8000/api/v1/tours/${tourId}/reviews`
        : `http://127.0.0.1:8000/api/v1/reviews/${reviewId}`;

    const res = await axios({
      method,
      url,
      data: {
        rating,
        review,
      },
    });

    if (res.data.status === 'success') {
      showAlert(
        res.data.status,
        type === 'add-review'
          ? 'Review created successfully'
          : 'Review updated successfully',
      );
      window.setTimeout(() => {
        location.assign('/get-my-reviews'); // Navigates to /me
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export const deleteReview = async (reviewId) => {
  try {
    const res = await axios({
      method: 'DELETE',
      url: `http://127.0.0.1:8000/api/v1/reviews/${reviewId}`,
    });

    showAlert('success', 'Review deleted successfully!');
    window.setTimeout(() => {
      location.assign('/get-my-reviews');
    }, 1200);
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
