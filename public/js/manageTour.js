/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

export const manageTour = async (data, type, tourId) => {
  try {
    let method;
    let url;
    if(type === 'create'){
      method = 'POST'
      url = 'http://127.0.0.1:8000/api/v1/tours'
    }else if(type === 'edit'){
      method = 'PATCH',
      url = `http://127.0.0.1:8000/api/v1/tours/${tourId}}`
    }

    const res = await axios({
      method,
      url,
      data: data,
    });

    if (res.data.status === 'success') {
      showAlert(res.data.status, `Tour ${type} successfully!`);
      window.setTimeout(() => {
        location.assign('/manage-tours');
      }, 1200);
    }
  } catch (err) {
    console.log(err);
    showAlert('error', err.response.data.message);
  }
};
