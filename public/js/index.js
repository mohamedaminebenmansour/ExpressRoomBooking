/* eslint-disable */
import '@babel/polyfill';
import { displayMap } from './mapbox';
import { login, logout } from './login';
import { updateSettings } from './updateSettings';
import { signup } from "./signup";
import { forgotPasswrd, resetPasswrd } from "./auth";
import { deleteRoom, addRoom, updateRoom } from "./room";
import { createBook, updateBook } from "./book";
import { deleteUser } from "./user";



// DOM ELEMENTS
const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const logOutBtn = document.querySelector('.nav__el--logout');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');
const signupForm = document.querySelector(".form--signup");
const forgotForm = document.querySelector('.form--forgot');
const resetForm = document.querySelector('.form--reset')
const formRoomDelete = document.querySelector('.form-room-delete')
const formAddRoom = document.querySelector('.form--add-room')
const formAddBook = document.querySelector('.form--add-book')
const formRoomUpdate = document.querySelector('.form-room-update')
const formUserDelete = document.querySelector('.form-user-delete')
const formUpdateBook = document.querySelector('.form--update-book')

// DELEGATION
if (mapBox) {
  const locations = JSON.parse(mapBox.dataset.locations);
  displayMap(locations);
}

if (signupForm) {
  signupForm.addEventListener("submit", e => {
    e.preventDefault();

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const passwordConfirm = document.getElementById("passwordConfirm").value;

    signup(name, email, password, passwordConfirm);
  });
}

if (loginForm)
  loginForm.addEventListener('submit', e => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });
if (forgotForm)
  forgotForm.addEventListener('submit', e => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    forgotPasswrd(email);
  });

if (resetForm)
  resetForm.addEventListener('submit', e => {
    e.preventDefault();
    console.log('resetForm')
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('passwordConfirm').value;
    resetPasswrd(password, passwordConfirm);
  });
if (logOutBtn) logOutBtn.addEventListener('click', logout);

if (userDataForm)
  userDataForm.addEventListener('submit', e => {
    e.preventDefault();
    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);

    updateSettings(form, 'data');
  });
if (formRoomUpdate)
  formRoomUpdate.addEventListener('submit', e => {
    e.preventDefault();

    // Extract the form data
    const roomId = document.getElementById('roomId').value;
    const name = document.getElementById('name').value;
    const capacity = parseInt(document.getElementById('capacity').value);
    const price = parseInt(document.getElementById('price').value);
    const priceDiscount = parseInt(document.getElementById('priceDiscount').value);

    const summary = document.getElementById('summary').value;
    const description = document.getElementById('description').value;
    const coordinates = document.getElementById('coordinates').value.split(',').map(coord => parseFloat(coord.trim()));
    const address = document.getElementById('address').value;
    const locationDescription = document.getElementById('locationDescription').value;
    console.log("price=", price)
    console.log("priceDiscount=", priceDiscount)
    // Construct a FormData object to send both text and file data
    const formData = new FormData();
    formData.append('roomId', roomId);
    formData.append('name', name);
    formData.append('capacity', capacity);
    formData.append('price', price);
    formData.append('priceDiscount', priceDiscount);
    formData.append('summary', summary);
    formData.append('description', description);
    formData.append('coordinates', coordinates.join(', ')); // Convert array to string
    formData.append('address', address);
    formData.append('locationDescription', locationDescription);

    // Append image files to the FormData object
    const imageCoverFile = document.getElementById('imageCover').files[0];
    const image1File = document.getElementById('image1').files[0];
    const image2File = document.getElementById('image2').files[0];
    const image3File = document.getElementById('image3').files[0];

    if (imageCoverFile) {
      formData.append('imageCover', imageCoverFile);
    }

    if (image1File) {
      formData.append('image1', image1File);
    }

    if (image2File) {
      formData.append('image2', image2File);
    }

    if (image3File) {
      formData.append('image3', image3File);
    }
    updateRoom(roomId, formData, 'data');
  });

if (userPasswordForm)
  userPasswordForm.addEventListener('submit', async e => {
    e.preventDefault();
    document.querySelector('.btn--save-password').textContent = 'Updating...';

    const passwordCurrent = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;
    await updateSettings(
      { passwordCurrent, password, passwordConfirm },
      'password'
    );

    document.querySelector('.btn--save-password').textContent = 'Save password';
    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
  });

if (formAddRoom)
  formAddRoom.addEventListener('submit', async e => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const capacity = parseInt(document.getElementById('capacity').value);
    const price = parseInt(document.getElementById('price').value);
    const priceDiscount = parseInt(document.getElementById('priceDiscount').value);
    const summary = document.getElementById('summary').value;
    const description = document.getElementById('description').value;
    const coordinates = document.getElementById('coordinates').value.split(',').map(coord => parseFloat(coord.trim()));
    const address = document.getElementById('address').value;
    const locationDescription = document.getElementById('locationDescription').value;

    // Construct JSON object
    const data = {
      name: name,
      capacity: capacity,
      price: price,
      priceDiscount: priceDiscount,
      summary: summary,
      description: description,
      location: {
        type: 'Point',
        coordinates: coordinates,
        address: address,
        description: locationDescription
      }
    };
    console.log("room:", data)
    addRoom(data);
  })

if (formRoomDelete)
  formRoomDelete.addEventListener('submit', async e => {
    e.preventDefault();
    const roomId = document.getElementById('roomId').value;
    console.log("deleted room:", roomId)
    deleteRoom(roomId);
  })

if (formUserDelete)
  formUserDelete.addEventListener('submit', async e => {
    e.preventDefault();
    console.log("heyheyhey-----------------------heyheyhey")
    const userId = document.getElementById('userId').value;
    console.log("deleted user:", userId)
    deleteUser(userId);
  })

if (formAddBook)
  formAddBook.addEventListener('submit', async e => {
    e.preventDefault();
    // Get values from the form
    //const user = document.getElementById('userId').value;
    const room = document.getElementById('roomId').value;
    console.log("roomId=,", room)
    const startDate = document.getElementById('startDate').value;
    console.log("startDate=,", startDate)
    const duration = document.getElementById('duration').value;
    console.log("duration=,", duration)

    // Create a JSON object with the form data
    const data = {
      schedule: {
        appointments: [
          {
            startDate: new Date(startDate), // Convert string to Date object
            duration: parseInt(duration) // Convert string to integer
          }
        ]
      }
    }
    console.log("book:", data)
    createBook(room, data)

  })

if (formUpdateBook)
  formUpdateBook.addEventListener('submit', async e => {
    e.preventDefault();
    // Get values from the form
    //const user = document.getElementById('userId').value;
    const bookId = document.getElementById('bookId').value;
    console.log("bookId=,", bookId)
    const startDate = document.getElementById('startDate').value;
    console.log("startDate=,", startDate)
    const duration = document.getElementById('duration').value;
    console.log("duration=,", duration)

    // Create a JSON object with the form data
    const data = {
      schedule: {
        appointments: [
          {
            startDate: new Date(startDate), // Convert string to Date object
            duration: parseInt(duration) // Convert string to integer
          }
        ]
      }
    }
    console.log("update book:", data)
    updateBook(bookId, data)

  })
