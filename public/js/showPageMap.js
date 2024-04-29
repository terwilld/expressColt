


mapboxgl.accessToken = mapToken;
// mapboxgl.accessToken = 'pk.eyJ1IjoidGVyd2lsbGQiLCJhIjoiY2x2ZDVnbTBxMHJtMTJpbGZjN205NDkxYSJ9.WxiMwn_bmml3TpTO8EDXQQ'
const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/streets-v12', // style URL
    // center: [-74.5, 40], // starting position [lng, lat]
    center: campground.geometry.coordinates,
    // center: [long, lat],
    // center: campground.geometry.coordinates
    // center: [<%= campground.geometry.coordinates %>], // starting position [lng, lat]
    zoom: 9, // starting zoom
});
// Add zoom and rotation controls to the map.
map.addControl(new mapboxgl.NavigationControl());
// Create a new marker.
const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
    `<h3>${campground.title}</h3><p>${campground.description}</p>`
);

const marker = new mapboxgl.Marker()
    .setLngLat(campground.geometry.coordinates)
    .setPopup(popup)
    .addTo(map);

    
