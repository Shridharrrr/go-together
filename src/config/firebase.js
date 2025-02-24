import { initializeApp } from "firebase/app";
//import { getAnalytics } from "firebase/analytics";
import { getAuth } from 'firebase/auth';
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAk2V7IWL3B7N493z2EFl9s9QDGqRVF-vY",
  authDomain: "gotogether-956d3.firebaseapp.com",
  projectId: "gotogether-956d3",
  storageBucket: "gotogether-956d3.firebasestorage.app",
  messagingSenderId: "469916883254",
  appId: "1:469916883254:web:6f4d2a2ca4487ca92bbb97",
  measurementId: "G-93NZRJE5WP"
};

const app = initializeApp(firebaseConfig);
//const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);