// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAW9ZAL7yDpMi6U1ShTPRvQzaY3vaWDVTQ",
  authDomain: "filtering-25d13.firebaseapp.com",
  projectId: "filtering-25d13",
  storageBucket: "filtering-25d13.firebasestorage.app",
  messagingSenderId: "183581135246",
  appId: "1:183581135246:web:0ecf9001787d4ba82814df",
  measurementId: "G-ZGY0GG52G4"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
export { app,auht};