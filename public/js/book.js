/* eslint-disable */
import axios from "axios";
import { showAlert } from "./alerts";

export const createBook = async (roomId, data) => {
    try {
        console.log("this is from data :::", data);
        const res = await axios({
            method: "POST",
            url: `http://127.0.0.1:3000/api/v1/rooms/${roomId}/reservations`,
            data
        });
        console.log("success")
        if (res.data.status === "ok") {
            showAlert("success", "book successfully!");
            window.setTimeout(() => {
                location.assign("/");
            }, 1000);
        }
    } catch (err) {
        showAlert("error", err.response.data.message);
    }
};


export const deleteRoom = async (roomID) => {
    console.log("ID of Room =" + roomID)
    try {
        console.log("const forgotPasswrd")
        const res = await axios({
            method: 'DELETE',
            url: `http://127.0.0.1:3000/api/v1/rooms/${roomID}`,
            data: {
            }
        });

        if (res.data.status === 'ok') {
            console.log(res)
            showAlert('success', 'Delete it');
            window.setTimeout(() => {
                location.assign('/managerooms');
            }, 1500);
        }
    } catch (err) {
        showAlert('error', err.response.data.message);
    }
};
/*
{
    "name": "tunisie room",
    "capacity": 2,
    "rating": 4.8,
    "ratingsAverge": 4.8,
    "ratingsQuantity": 25,
    "price": 200,
    "priceDiscount": 180,
    "summary": "A luxurious suite with breathtaking views.",
    "description": "This suite offers all the comforts and amenities for a relaxing stay.",
    "imageCover": "tunCover.jpg",
    "image": ["tun01.jpg", "tun02.jpg", "tun03.jpg"],
    "location": {
        "type": "Point",
        "coordinates": [-73.968285, 40.785091],
        "address": "123 Main St, New York, NY",
        "description": "Located in the heart of New York City."
    }
}
*/
export const addRoom = async (data) => {

    try {
        console.log("adding room from room.js")
        const res = await axios({
            method: 'POST',
            url: `http://127.0.0.1:3000/api/v1/rooms`,
            data
        });

        if (res.data.status === 'ok') {
            console.log(res)
            showAlert('success', 'add it');
            window.setTimeout(() => {
                location.assign('/managerooms');
            }, 1500);
        }
    } catch (err) {
        showAlert('error', err.response.data.message);
    }
};

export const updateBook = async (bookId, data) => {
    try {
        console.log("updating room from room.js")
        const res = await axios({
            method: 'PATCH',
            url: `http://127.0.0.1:3000/api/v1/reservations/${bookId}`,
            data
        });
        console.log("Iam okay bro ::", res.data)
        if (res.data.status === 'ok') {
            showAlert('success', ` updated successfully!`);
            window.setTimeout(() => {
                location.assign('/managerooms');
            }, 1500);
        }
    } catch (err) {
        showAlert('error', err.response.data.message);
    }
};