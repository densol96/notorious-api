import axios from 'axios';
import { showAlert } from './alerts.js';

export const logUserIn = async function (email, password) {
    // Axios provides a mechanism to handle errors based on the HTTP status code of the response
    try {
        const result = await axios({
            method: 'POST',
            url: 'http://127.0.0.1:3000/api/v1/users/login',
            // define what is being passed in to body
            data: {
                email,
                password,
            },
        });
        showAlert('success', 'You have logged in successfully!');
        setTimeout(() => {
            location.assign('/');
        }, 1500);
    } catch (err) {
        showAlert('error', err.response.data.message);
    }
};

export const logUserOut = async () => {
    try {
        const result = await axios({
            method: 'GET',
            url: 'http://127.0.0.1:3000/api/v1/users/logout',
        });

        if ((result.data.status = 'success')) {
            // will reload the page from the server, not the browser cash that might store user menu from before
            // location.reload(true);
            location.assign('/');
        }
    } catch (err) {
        showAlert('error', 'Error logging out ');
    }
};
