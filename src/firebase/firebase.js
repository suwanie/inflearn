import { initializeApp } from "firebase/app";
import "firebase/auth";
import "firebase/database";
import "firebase/storage";
const firebaseConfig = {
  apiKey: "AIzaSyDQQPb3YuEqlvL1gei13TAnOWgQLcDspL4",
  authDomain: "inflearn-a42a9.firebaseapp.com",
  databaseURL:
    "https://inflearn-a42a9-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "inflearn-a42a9",
  storageBucket: "inflearn-a42a9.appspot.com",
  messagingSenderId: "971991712295",
  appId: "1:971991712295:web:b511268973607b24848402",
  measurementId: "G-XZ86S5C2FH",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export default app;
// const analytics = getAnalytics(app);
