/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

export const deleteSetting = async (id, type) => {
  try {
    let url;
    let redirect;

    if (type === 'user') {
      url = `/api/v1/users/${id}`;
      redirect = '/manage-users';
    } else if (type === 'review') {
      url = `/api/v1/reviews/${id}`;
      redirect = '/manage-reviews';
    } else if (type === 'tour') {
      url = `/api/v1/tours/${id}`;
      redirect = '/manage-tours';
    } else if (type === 'booking') {
      url = `/api/v1/bookings/${id}`;
      redirect = '/manage-bookings';
    }

    const res = await axios({
      method: 'DELETE',
      url,
    });


    showAlert('success', `Delete ${type} successfully!`);
    window.setTimeout(() => {
      location.assign(redirect)
    }, 1500);
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export const updateRole = async (userId, role) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url: `/api/v1/users/${userId}`,
      data: {
        role,
      },
    });

    if (res.data.status === 'success') {
      showAlert('success', `User's role updated to ${role}`);
      window.setTimeout(() => {
        window.location.reload();
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message)
  }
};

export const addGuide = async (tourId, guideId) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url: `/api/v1/tours/${tourId}/add-lead-guide`,
      data: {
        guideId,
      },
    });

    if (res.data.status === 'success') {
      showAlert('success', `Lead guide added!`);
      window.setTimeout(() => {
        window.location.reload();
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export const removeGuide = async (tourId, guideId) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url: `/api/v1/tours/${tourId}/remove-guide`,
      data: {
        guideId,
      },
    });

    if (res.data.status === 'success') {
      showAlert('success', `Removed Successfully!`);
      window.setTimeout(() => {
        window.location.reload();
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
