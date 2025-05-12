// Обернем весь код в DOMContentLoaded, чтобы форма точно была загружена
document.addEventListener("DOMContentLoaded", function () {
  // Инициализация Firebase (один раз, если ранее не инициализировано)
  // Если firebase.initializeApp уже вызывался, этот код можно пропустить
  if (!firebase.apps.length) {
    const firebaseConfig = {
      apiKey: "AIzaSyCpdDWrtc9Vq_zxMjSEtZIxaJzgDCNQhy0",
      authDomain: "polls-main-322.firebaseapp.com",
      projectId: "polls-main-322",
      storageBucket: "polls-main-322.firebasestorage.app",
      messagingSenderId: "15214177941",
      appId: "1:15214177941:web:05fd8dbb514c46d5e2b59c",
      measurementId: "G-VG4GQXFXQ9",
    };
    firebase.initializeApp(firebaseConfig);
  }

  const auth = firebase.auth();
  const db = firebase.firestore();

  const registerForm = document.getElementById("register-form");
  if (!registerForm) {
    console.error("registerForm не найден!");
    return;
  }

  registerForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const username = registerForm.username.value;
    const email = registerForm.email.value;
    const password = registerForm.password.value;

    auth
      .createUserWithEmailAndPassword(email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        return db.collection("users").doc(user.uid).set({
          username: username,
          email: email,
          pollsCompleted: 0,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        });
      })
      .then(() => {
        alert("Регистрация прошла успешно");
        window.location.href = "profile.html"; // Перенаправление
      })
      .catch((error) => {
        console.error("Ошибка регистрации:", error.message);
        alert(error.message);
      });
  });
});
