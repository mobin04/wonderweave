/* eslint-disable */
import { bookTour } from './stripe';
import { bookingConfirm } from './bookingConfirm';
import { manageReview } from './manageReview';
import { deleteReview } from './manageReview';
import { manageTour } from './manageTour';
import {
  deleteSetting,
  addGuide,
  updateRole,
  removeGuide,
} from './manageUser';

// 1) TOUR-BOOKING
export const bookTourFunc = (bookBtn) => {
  bookBtn.addEventListener('click', (e) => {
    e.preventDefault();

    const tourId = bookBtn.getAttribute('data-tourId');

    const selectedDate = document.querySelector(
      'input[name="date"]:checked',
    ).value;

    bookTour(tourId, selectedDate);
  });
};

// 2) // BOOKING-CONFIRM
// export const confirmBookingFunc = (bookingSuccessContainer) => {
//   const tourData = JSON.parse(
//     bookingSuccessContainer.getAttribute('data-tour'),
//   );

//   const id = tourData.id;
//   const selectedDate = tourData.selectedDate;

//   bookingConfirm(id, selectedDate);
// };

// 3) CREATE-REVIEW
export const createReviewFunc = (reviewSubmitForm) => {
  reviewSubmitForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const reviewId = document
      .querySelector('.review-card-submit')
      .getAttribute('data-reviewId');

    const type = window.location.pathname.split('/')[1];
    const tourId = document
      .querySelector('.review-card-form')
      .getAttribute('data-tourId');

    const review = document.querySelector('.review-card-textarea').value;
    const selectedRating = document.querySelector(
      'input[name="rating"]:checked',
    ).value;

    await manageReview(type, reviewId, tourId, selectedRating, review);
  });
};

// DELETE-REVIEW
export const deleteReviewFunc = (reviewDeleteBtn) => {
  reviewDeleteBtn.forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();

      const reviewId = btn.getAttribute('data-reviewId');

      await deleteReview(reviewId);
    });
  });
};

// CREATE TOUR & VIEW-ALL TOUR FUNCTIONALITY
export const viewAllToursBtns = () => {
  const viewAllToursBtn = document.querySelector('.tour-admin-btn--list');
  const createTourForm = document.getElementById('createTourForm');
  const toursList = document.getElementById('toursList');

  if (viewAllToursBtn) {
    viewAllToursBtn.addEventListener('click', () => {
      if (createTourForm && toursList) {
        createTourForm.style.display = 'none';
        toursList.style.display = 'block';
      }
    });
  }
};

// ADD DATE & ADD LOCAION & REMOVE BUTTON FUNCTIONAL ON
export const addLocationAndDateFunc = () => {
  document.addEventListener('DOMContentLoaded', function () {
    const addDateBtn = document.querySelector(
      ".tour-admin-btn--add[type='button']",
    );
    const addLocationBtn = document.querySelectorAll(
      ".tour-admin-btn--add[type='button']",
    )[1];
    const tourDatesContainer = document.getElementById('tourDatesContainer');
    const locationsContainer = document.getElementById('locationsContainer');

    let dateIndex = 1;
    let locationIndex = 1;

    // Function to add new date fields with remove button
    addDateBtn.addEventListener('click', () => {
      const dateItem = document.createElement('div');
      dateItem.classList.add('tour-admin-date-item');
      dateItem.id = `dateItem${dateIndex}`;
      dateItem.innerHTML = `
        <div class="tour-admin-form-row">
          <div class="tour-admin-form-group">
            <label class="tour-admin-form-label" for="tourDate${dateIndex}">Date</label>
            <input class="tour-admin-form-input" type="date" id="tourDate${dateIndex}" name="dates[${dateIndex}][date]" required>
          </div>
          <div class="tour-admin-form-group">
            <label class="tour-admin-form-label" for="tourParticipants${dateIndex}">Participants</label>
            <input class="tour-admin-form-input" type="number" id="tourParticipants${dateIndex}" name="dates[${dateIndex}][participants]" min="0" value="0">
          </div>
        </div>
      `;

      // Initialize the remove button
      const removeBtn = document.createElement('button');
      removeBtn.classList.add('tour-admin-btn', 'tour-admin-btn--remove');
      removeBtn.textContent = 'Remove';
      removeBtn.type = 'button';

      // Attach remove functionality
      removeBtn.addEventListener('click', () => {
        dateItem.remove();
      });

      dateItem.appendChild(removeBtn);
      tourDatesContainer.appendChild(dateItem);
      dateIndex++;
    });

    //*************************** FUNCTION TO ADD NEW LOCATION FIELDS WITH REMOVE BUTTON

    addLocationBtn.addEventListener('click', () => {
      const locationItem = document.createElement('div');
      locationItem.classList.add('tour-admin-location-item');
      locationItem.id = `locationItem${locationIndex}`;
      locationItem.innerHTML = `
        <div class="tour-admin-form-row">
          <div class="tour-admin-form-group">
            <label class="tour-admin-form-label" for="locationDay${locationIndex}">Day</label>
            <input class="tour-admin-form-input" type="number" id="locationDay${locationIndex}" name="locations[${locationIndex}][day]" min="1" required>
          </div>
          <div class="tour-admin-form-group">
            <label class="tour-admin-form-label" for="locationDescription${locationIndex}">Description</label>
            <input class="tour-admin-form-input" type="text" id="locationDescription${locationIndex}" name="locations[${locationIndex}][description]" required>
          </div>
        </div>
        <div class="tour-admin-form-row">
          <div class="tour-admin-form-group">
            <label class="tour-admin-form-label" for="locationLat${locationIndex}">Latitude</label>
            <input class="tour-admin-form-input" type="number" id="locationLat${locationIndex}" name="locations[${locationIndex}][coordinates][1]" step="any" required>
          </div>
          <div class="tour-admin-form-group">
            <label class="tour-admin-form-label" for="locationLng${locationIndex}">Longitude</label>
            <input class="tour-admin-form-input" type="number" id="locationLng${locationIndex}" name="locations[${locationIndex}][coordinates][0]" step="any" required>
          </div>
        </div>
      `;

      const removeBtn = document.createElement('button');
      removeBtn.classList.add('tour-admin-btn', 'tour-admin-btn--remove');
      removeBtn.textContent = 'Remove';
      removeBtn.type = 'button';

      // Attach remove functionality
      removeBtn.addEventListener('click', () => {
        locationItem.remove();
      });

      locationItem.appendChild(removeBtn);
      locationsContainer.appendChild(locationItem);
      locationIndex++;
    });
  });
};

// GET THE INFORMATIONS FROM TOUR CREATE FORM AND THEN CREATE TOUR.
export const createTourFunc = (saveTourBtn, type) => {
  saveTourBtn.addEventListener('click', async (e) => {
    e.preventDefault(); // Prevent form from refreshing
    
    const tourId = type === 'edit' ? tourIdsaveTourBtn.getAttribute('data-tourId') : '';

    const form = new FormData(); // Collect form details automatically.
    form.append('name', document.getElementById('name').value); //.append() add key-value pairs to form
    form.append('duration', document.getElementById('duration').value);
    form.append('maxGroupSize', document.getElementById('maxGroupSize').value);
    form.append('difficulty', document.getElementById('difficulty').value);
    form.append('price', document.getElementById('price').value);
    form.append('summary', document.getElementById('summary').value);
    form.append('description', document.getElementById('description').value);
    form.append('imageCover', document.getElementById('imageCover').files[0]);

    const files = document.getElementById('images').files;
    for (let i = 0; i < files.length; i++) {
      form.append('images', files[i]); // Append each file separately
    }

    form.append('secretTour', document.getElementById('secretTour').checked);

    // ✅ Extract startLocation fields
    const startLocation = {
      address: document.getElementById('startLocationAddress').value,
      description: document.getElementById('startLocationDescription').value,
      coordinates: [
        parseFloat(document.getElementById('startLocationLng').value), // Longitude first
        parseFloat(document.getElementById('startLocationLat').value), // Latitude second
      ],
    };
    form.append('startLocation', JSON.stringify(startLocation));

    // ✅ Extract all Tour Dates and Participants
    const tourDates = [];
    const startDates = [];
    document
      .querySelectorAll('.tour-admin-date-item')
      .forEach((item, index) => {
        const dateInput = item.querySelector(
          `input[name="dates[${index}][date]"]`,
        );
        const participantsInput = item.querySelector(
          `input[name="dates[${index}][participants]"]`,
        );

        if (dateInput && participantsInput) {
          tourDates.push({
            date: dateInput.value,
            participants: parseInt(participantsInput.value, 10) || 0,
          });
          startDates.push(dateInput.value);
        }
      });

    form.append('startDates', JSON.stringify(startDates));

    // Append dates as JSON (FormData does not support arrays directly)
    form.append('dates', JSON.stringify(tourDates));

    const locations = [];
    document
      .querySelectorAll('.tour-admin-location-item')
      .forEach((item, index) => {
        const day = item.querySelector(
          `input[name="locations[${index}][day]"]`,
        );
        const description = item.querySelector(
          `input[name="locations[${index}][description]"]`,
        );

        const coordinates = [];

        const lat = item.querySelector(
          `input[name="locations[${index}][coordinates][1]"]`,
        ).value;
        const lng = item.querySelector(
          `input[name="locations[${index}][coordinates][0]"]`,
        ).value;
        coordinates.push(lat, lng);

        if (lat && lng && day && description) {
          locations.push({
            day: day.value,
            description: description.value,
            coordinates,
          });
        }
      });

    // Append dates as JSON (FormData does not support arrays directly)
    form.append('locations', JSON.stringify(locations));

    // console.log([...form.entries()]);

    await manageTour(form, type, tourId);
  });
};

// SEARCH-USER FUNCTIONALITY
export const searchUserFunc = (searchInput) => {
  searchInput.addEventListener('keyup', function () {
    let filter = this.value.toLowerCase();
    let rows = document.querySelectorAll('#userTable tr');

    rows.forEach((row) => {
      let name = row.cells[0].textContent.toLowerCase();
      let email = row.cells[1].textContent.toLowerCase();
      let role = row.cells[2].textContent.toLowerCase();

      if (
        name.includes(filter) ||
        email.includes(filter) ||
        role.includes(filter)
      ) {
        row.style.display = '';
      } else {
        row.style.display = 'none';
      }
    });
  });
};

// DELETE USER & REVIEW IMPLEMENTATION
export const deleteFunc = (deleteButton, type) => {
  deleteButton.addEventListener('click', async (e) => {
    e.preventDefault();
    const id = deleteButton.getAttribute(`data-${type}Id`);
    if (!id) {
      return alert(`No ${type} id found!`);
    }
    await deleteSetting(id, type);
  });
};

// CHANGE USER ROLE IMPLEMENTATION
export const changeUserRoleFunc = (changeRoleBtn) => {
  changeRoleBtn.forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      // Get the user ID from the button attribute
      const userId = btn.getAttribute('data-userId');

      // Find the select dropdown inside the same row
      const row = btn.closest('tr'); // Get the table row
      const roleSelect = row.querySelector('.admin-user-role-select');

      // Get the selected value
      const newRole = roleSelect.value;
      await updateRole(userId, newRole);
    });
  });
};

// ADD LEAD-GUIDE IMPLEMENTATION
export const addGuideFunc = (btns, type) => {
  btns.forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      let selectLeadGuide;

      // Find the closest tour section related to the clicked button

      const tourSection = btn.closest('.admin-tour-detail-section');

      // Get the correct tour ID from this section
      const tourId = tourSection
        .querySelector('.tour-header')
        .getAttribute('data-tourId');

      // Get the selected guide ID from the dropdown inside this specific tour section

      if (type === 'lead-guide') {
        selectLeadGuide = tourSection.querySelector('.select-lead-guide');
      } else if (type === 'guide') {
        selectLeadGuide = tourSection.querySelector('.select-guide');
      }

      const guideId = selectLeadGuide.value;
      // console.log(`guide ID:${guideId} | tour ID: ${tourId}`);

      await addGuide(tourId, guideId);
    });
  });
};

// GUIDE REMOVE IMPLEMENTATION
export const removeGuideFunc = (removeBtn) => {
  removeBtn.forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();

      const guideId = btn.getAttribute('data-guideId');

      const tourSection = btn.closest('.admin-tour-detail-section');
      const tourId = tourSection
        .querySelector('.tour-header')
        .getAttribute('data-tourId');

      // console.log(`GUIDE ID::${guideId} | TOUR ID::${tourId}`);

      await removeGuide(tourId, guideId);
    });
  });
};

// REVIEW-SEARCH-FUNCTIONALITY
export const reviewSearchFunc = (reviewSearchInp) => {
  const reviewsContainer = document.querySelector('.admin-reviews-content');
  const reviewCards = document.querySelectorAll('.admin-reviews-user-group');

  let noReviewsMessage = reviewsContainer.querySelector('.admin-reviews-empty');
  if (!noReviewsMessage) {
    noReviewsMessage = document.createElement('div');
    noReviewsMessage.className = 'admin-reviews-empty';
    noReviewsMessage.innerHTML = `<p class="admin-reviews-message">No reviews found.</p>`;
    noReviewsMessage.style.display = 'none';
    reviewsContainer.appendChild(noReviewsMessage);
  }

  reviewSearchInp.addEventListener('input', function () {
    const searchValue = reviewSearchInp.value.toLowerCase().trim();
    let hasAnyResults = false;

    reviewCards.forEach((userGroup) => {
      let hasMatch = false;
      userGroup
        .querySelectorAll('.admin-reviews-card')
        .forEach((reviewCard) => {
          const tourName = reviewCard
            .querySelector('.admin-reviews-tour-name a')
            .textContent.toLowerCase();
          const reviewText = reviewCard
            .querySelector('.admin-reviews-text')
            .textContent.toLowerCase();
          const userName = userGroup
            .querySelector('.admin-reviews-user-name')
            .textContent.toLowerCase();

          if (
            userName.includes(searchValue) ||
            tourName.includes(searchValue) ||
            reviewText.includes(searchValue)
          ) {
            reviewCard.style.display = '';
            hasMatch = true;
            hasAnyResults = true;
          } else {
            reviewCard.style.display = 'none';
          }
        });

      userGroup.style.display = hasMatch ? '' : 'none';
    });

    // Show "No reviews found" message when no results
    noReviewsMessage.style.display = hasAnyResults ? 'none' : 'block';
  });
};
