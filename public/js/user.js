import axios from 'axios';
import { showAlert } from './alerts';

export const deleteUser = async (userId) => {
    console.log("ID of user =" + userId)
    try {

        const res = await axios({
            method: 'DELETE',
            url: `http://127.0.0.1:3000/api/v1/users/${userId}`,
            data: {
            }
        });

        if (res.data.status === 'ok') {
            console.log(res)
            showAlert('success', 'Delete it');
            window.setTimeout(() => {
                location.assign('/manageusers');
            }, 1500);
        }
    } catch (err) {
        showAlert('error', err.response.data.message);
    }
};