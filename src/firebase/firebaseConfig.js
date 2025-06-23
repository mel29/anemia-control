// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "API-KEY",
  authDomain: "anemia-control.firebaseapp.com",
  projectId: "anemia-control",
  storageBucket: "anemia-control.firebasestorage.app",
  messagingSenderId: "MESSAGING-SENDER-ID",
  appId: "APP-ID",
  measurementId: "MEASUREMENT-ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
const auth = getAuth(app);
const db = getFirestore(app);
const analytics = getAnalytics(app);

export { app, storage, auth, db, analytics }; 
