// Import the functions you need from the SDKs you need

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use

// https://firebase.google.com/docs/web/setup#available-libraries


// Your web app's Firebase configuration

export const firebaseConfig = {

  apiKey: "AIzaSyBlKrUPgCu77PR2Ct84Fnp-tk-n6zTw174",

  authDomain: "birdnest-d418e.firebaseapp.com",

  projectId: "birdnest-d418e",

  storageBucket: "birdnest-d418e.appspot.com",

  messagingSenderId: "130242479713",

  appId: "1:130242479713:web:490bdb099fb1a0e4b0cc20"

};


// Initialize Firebase

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
