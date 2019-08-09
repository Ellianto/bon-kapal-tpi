import firebase from '@firebase/app';
import '@firebase/auth';
import '@firebase/functions';   

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyA2GqamzOo3YJyjTgtGu7jtEeXnvPAOndE",
    authDomain: "bon-kapal.firebaseapp.com",
    databaseURL: "https://bon-kapal.firebaseio.com",
    projectId: "bon-kapal",
    storageBucket: "bon-kapal.appspot.com",
    messagingSenderId: "296318562493",
    appId: "1:296318562493:web:4785610aa3cd868f"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION);

export default firebase;
export const fireAuth = firebase.auth();
export const addShipMethod  = firebase.app().functions('asia-east2').httpsCallable('addShip');
export const getShipsMethod = firebase.app().functions('asia-east2').httpsCallable('getShips');
export const aggrBonMethod  = firebase.app().functions('asia-east2').httpsCallable('aggrBon');
export const getBooksMethod = firebase.app().functions('asia-east2').httpsCallable('getBooks');
export const openBookMethod = firebase.app().functions('asia-east2').httpsCallable('openBook');
export const addBonMethod   = firebase.app().functions('asia-east2').httpsCallable('addBon');
export const getBonsMethod  = firebase.app().functions('asia-east2').httpsCallable('getBons');
export const editBonMethod  = firebase.app().functions('asia-east2').httpsCallable('editBon');
export const deleteBonMethod= firebase.app().functions('asia-east2').httpsCallable('deleteBon');
export const getRecentMethod= firebase.app().functions('asia-east2').httpsCallable('getRecent');