import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";



const firebaseConfig = {
  apiKey: "AIzaSyBV6n7MgNAbkImRQsko8o3dMQ-pkAdGAQA",
  authDomain: "tippamaps-92872.firebaseapp.com",
  projectId: "tippamaps-92872",
  storageBucket: "tippamaps-92872.appspot.com",
  messagingSenderId: "96942590690",
  appId: "1:96942590690:web:0d5dc72b1deb8785a16cbb",
  measurementId: "G-54QRG3NSFX"
};

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);
  export { auth, db };