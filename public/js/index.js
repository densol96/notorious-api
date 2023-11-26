import '@babel/polyfill';
import { logUserIn, logUserOut } from './login.js';
import { displayMap } from './mapbox.js';

// LOGIN FORM
const loginForm = document.querySelector('.form');
const emailField = document.querySelector('#email');
const passwordField = document.querySelector('#password');

if (loginForm) {
    loginForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const email = emailField.value;
        const password = passwordField.value;
        logUserIn(email, password);
    });
}

// RENDER THE MAP
const locationString = document.querySelector(`#map`);
if (locationString) {
    const locations = JSON.parse(locationString.dataset.locations);
    displayMap(locations);
}

// LOG USER OUT
const logOutBtn = document.querySelector('.nav__el--logout');

if (logOutBtn) {
    logOutBtn.addEventListener('click', logUserOut);
}

console.log('hello');
