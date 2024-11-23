import axios from 'axios';
import { showAlert } from './alerts';

export const forgotPasswrd = async (email) => {
    try {
        console.log("const forgotPasswrd")
        const res = await axios({
            method: 'POST',
            url: 'http://127.0.0.1:3000/api/v1/users/forgetPassword',
            data: {
                email
            }
        });

        if (res.data.status === 'ok') {
            console.log(res)
            showAlert('success', 'go to email');
            window.setTimeout(() => {
                location.assign('/');
            }, 1500);
        }
    } catch (err) {
        showAlert('error', err.response.data.message);
    }
};

export const resetPasswrd = async (password, passwordConfirm) => {
    try {
        console.log("reset passwrd")
        const pathname = window.location.pathname;

        // Split the pathname by "/" and get the last segment
        const segments = pathname.split('/');
        const lastSegment = segments[segments.length - 1];

        console.log(lastSegment);
        const res = await axios({
            method: 'PATCH',
            url: `http://127.0.0.1:3000/api/v1/users/resetPassword/${lastSegment}`,
            data: {
                password,
                passwordConfirm
            }
        });

        if (res.data.status === 'ok') {
            console.log(res)
            showAlert('success', 'password reset successful');
            window.setTimeout(() => {
                location.assign('/');
            }, 1500);
        }
    } catch (err) {
        showAlert('error', err.response.data.message);
    }
};