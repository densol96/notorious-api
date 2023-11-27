import '@babel/polyfill';
import { logUserIn, logUserOut } from './login.js';
import { displayMap } from './mapbox.js';
import { updateAccount } from './updateSettings.js';

// LOGIN FORM
const loginForm = document.querySelector('.form--login');
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

// UPDATE SETTINGS
const formUserData = document.querySelector('.form-user-data');
if (formUserData) {
    formUserData.addEventListener('submit', function (e) {
        e.preventDefault();
        const name = formUserData.querySelector('#name').value;
        const email = formUserData.querySelector('#email').value;
        updateAccount('profile', {
            name,
            email,
        });
    });
}

// UPDATE PASSWORD
const changePasswordForm = document.querySelector('.form-user-settings');
if (changePasswordForm) {
    const button = changePasswordForm.querySelector('button.btn');
    changePasswordForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        button.textContent = 'In progress..';
        const oldPassword =
            changePasswordForm.querySelector('#password-current');
        const password = changePasswordForm.querySelector('#password');
        const passwordConfirm =
            changePasswordForm.querySelector('#password-confirm');
        await updateAccount('password', {
            oldPassword: oldPassword.value,
            password: password.value,
            passwordConfirm: passwordConfirm.value,
        });
        oldPassword.value = '';
        password.value = '';
        passwordConfirm.value = '';

        button.textContent = 'Save password';
    });
}
