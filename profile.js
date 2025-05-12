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
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

document.addEventListener("DOMContentLoaded", function () {
  firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
      const uid = user.uid;
      firebase.firestore().collection("users").doc(uid).get()
        .then(function (doc) {
          if (doc.exists) {
            const userData = doc.data();
            document.getElementById("usernameDisplay").textContent = userData.username || "Без имени";
            document.getElementById("pollsCompleted").textContent = userData.pollsCompleted || 0;
          } else {
            console.log("Документ пользователя не найден");
          }
        })
        .catch(function (error) {
          console.error("Ошибка получения данных пользователя: ", error);
        });
    } else {
      window.location.href = "login.html";
    }
  });
});
