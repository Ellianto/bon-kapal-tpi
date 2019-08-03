import firebase from '@firebase/app';
import '@firebase/auth';
import '@firebase/functions';   

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyB_7LeEKDkR36kfLmPP-1tMmAiHfYI4IyY",
    authDomain: "bon-kapal-tpi.firebaseapp.com",
    databaseURL: "https://bon-kapal-tpi.firebaseio.com",
    projectId: "bon-kapal-tpi",
    storageBucket: "bon-kapal-tpi.appspot.com",
    messagingSenderId: "629513482934",
    appId: "1:629513482934:web:81d570be921cdc0b"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION);

export default firebase;
export const fireAuth = firebase.auth();
export const addShipMethod  = firebase.functions().httpsCallable('addShip');
export const getShipsMethod = firebase.functions().httpsCallable('getShips');
export const addBookMethod  = firebase.functions().httpsCallable('addBook');
export const getBooksMethod = firebase.functions().httpsCallable('getBooks');
export const openBookMethod = firebase.functions().httpsCallable('openBook');
export const addBonMethod   = firebase.functions().httpsCallable('addBon');
export const getBonsMethod  = firebase.functions().httpsCallable('getBons');
export const editBonMethod  = firebase.functions().httpsCallable('editBon');
export const deleteBonMethod= firebase.functions().httpsCallable('deleteBon');
export const getRecentMethod= firebase.functions().httpsCallable('getRecent');