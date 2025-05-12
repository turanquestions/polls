// firebase-config.js или в начале script.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCpdDWrtc9Vq_zxMjSEtZIxaJzgDCNQhy0",
  authDomain: "polls-main-322.firebaseapp.com",
  projectId: "polls-main-322",
  storageBucket: "polls-main-322.firebasestorage.app",
  messagingSenderId: "15214177941",
  appId: "1:15214177941:web:05fd8dbb514c46d5e2b59c",
  measurementId: "G-VG4GQXFXQ9",
};

// Инициализация Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

firebase
  .auth()
  .setPersistence(firebase.auth.Auth.Persistence.LOCAL)
  .catch(function (error) {
    console.error("Ошибка установки постоянства сессии: ", error);
  });
