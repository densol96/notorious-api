import axios from 'axios';
import { showAlert } from './alerts.js';

// types ===> password vs. profile
export const updateAccount = async (type, data) => {
    const url =
        type === 'password'
            ? 'http://127.0.0.1:3000/api/v1/users/change-my-password'
            : 'http://127.0.0.1:3000/api/v1/users/update-me';
    try {
        const result = await axios({
            method: 'PATCH',
            url,
            data,
        });
        showAlert('success', `Your ${type} has successfully been updated!`);
        setTimeout(() => {
            location.reload();
        }, 1500);
    } catch (err) {
        showAlert('error', err.response.data.message);
    }
};
