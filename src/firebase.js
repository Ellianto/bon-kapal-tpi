import firebase from '@firebase/app';
import '@firebase/firestore';
import '@firebase/auth';
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
export const firestore = firebase.firestore();
export const fireAuth = firebase.auth();