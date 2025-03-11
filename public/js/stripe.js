/* eslint-disable */
import { showAlert } from './alerts';

import axios from 'axios';

const stripe = Stripe(
  'pk_test_51R02DPAXlJ3kcN71UXcNEYoBkQh1VgmYyAUkTPoo7qOQ86b6KSaRLIPx5B0FMZjwB4WlyVYfjNhUx8l87bk5aT6800oSH6K4eS',
);

export const bookTour = async (tourId) => {
  try {
    // 1) Get checkout session from API.
    const session = await axios(
      `http://127.0.0.1:8000/api/v1/bookings/checkout-session/${tourId}`,
    );
    console.log(session);

    // 2) Create checkout form + charge credit card
    await stripe.redirectToCheckout({
      // REDIRECTING TO CHECKOUT PAGE
      sessionId: session.data.session.id,
    });
  } catch (err) {
    console.log(err);
    showAlert('error', err.message);
  }
};
