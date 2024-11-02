import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import "firebase/compat/storage";


const firebaseConfig = {
    apiKey: "AIzaSyDofrxn0gkJrhSnhvpKlpON76DeBuTshoU",
    authDomain: "item-d2ccb.firebaseapp.com",
    projectId: "item-d2ccb",
    storageBucket: "item-d2ccb.appspot.com",
    messagingSenderId: "422200886260",
    appId: "1:422200886260:web:9976e2509a0f6f3744afa1",
    measurementId: "G-T8QB1BPYM3"
  };

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

export { firebase }



