/* eslint-disable*/


export const displaymap = (locations) => {
  // SETTING UP MAPBOX ACCESS TOKEN
  mapboxgl.accessToken =
    'pk.eyJ1IjoibW9iaW44MTEzIiwiYSI6ImNtN215YTU1MDB1encyanNhZDhwMmlsdmsifQ.okBjamSAp5aitkVTMbbWzA';

  // INITIALIZING THE MAP
  const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mobin8113/cm7n5rxuq00fe01sbg53b4iq9', // style URL
    scrollZoom: false,
    // center: [-118.113491, 34.111745], // starting position [lng, lat]
    // zoom: 9, // starting zoom
    // interactive: false,
  });

  // THIS WILL HELP THE MAP AUTO-FIT ALL TOUR LOCATIONS.
  const bounds = new mapboxgl.LngLatBounds();

  // LOOPING THROUGH LOCATIONS
  locations.forEach((loc) => {
    // Create marker
    const el = document.createElement('div'); // Creates a new <div> element in the DOM.
    el.className = 'marker'; //  Gives it a CSS class (marker) to style it.

    // ADDING THE MARKER TO THE MAP
    new mapboxgl.Marker({
      element: el, // Uses the created <div> as the marker
      anchor: 'bottom', // Positions the marker at the bottom (so it "sits" on the map)
    })
      .setLngLat(loc.coordinates) // Sets the marker's position using location coordinates
      .addTo(map); // Adds the marker to the map

    // ADDING A POPUP
    new mapboxgl.Popup({
      offset: 40, // Moves the popup slightly above the marker
    })
      .setLngLat(loc.coordinates) // Sets the popup position
      .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`) // Adds tour info inside the popup
      .addTo(map); // Adds the Popup to the map

    // Extend the map bounds to include current location
    bounds.extend(loc.coordinates); // Each time we add a location, we expand the bounds so that all markers fit inside the visible area.
  });

  map.fitBounds(bounds, {
    //Zooms and adjusts the map so all locations are visible
    padding: {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100,
    },
  });
};
