import axios from 'axios';

export const logUserIn = async function (email, password) {
    try {
        const result = await axios({
            method: 'POST',
            url: 'http://127.0.0.1:3000/api/v1/users/login',
            data: {
                email,
                password,
            },
        });
        alert('Logged in succesfully!');
        setTimeout(() => {
            location.assign('/');
        }, 1500);
    } catch (err) {
        alert(err.response.data.message);
    }
};
