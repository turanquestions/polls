document.addEventListener("DOMContentLoaded", function () {
  // Ваши конфигурационные данные из Firebase Console
  const firebaseConfig = {
    apiKey: "AIzaSyCpdDWrtc9Vq_zxMjSEtZIxaJzgDCNQhy0",
    authDomain: "polls-main-322.firebaseapp.com",
    projectId: "polls-main-322",
    storageBucket: "polls-main-322.firebasestorage.app",
    messagingSenderId: "15214177941",
    appId: "1:15214177941:web:05fd8dbb514c46d5e2b59c",
    measurementId: "G-VG4GQXFXQ9",
  };

  // Инициализация Firebase (если ещё не инициализировано)
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }

  // Инициализация сервиса аутентификации
  const auth = firebase.auth();

  // Получаем элемент формы входа
  const loginForm = document.getElementById("login-form");
  if (!loginForm) {
    console.error("loginForm не найден!");
    return;
  }

  // Обработка отправки формы
  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const email = loginForm.email.value;
    const password = loginForm.password.value;

    // Входим в систему через Firebase Authentication
    auth
      .signInWithEmailAndPassword(email, password)
      .then((userCredential) => {
        alert("Вход выполнен успешно");
        // Перенаправляем пользователя на страницу профиля
        window.location.href = "profile.html";
      })
      .catch((error) => {
        console.error("Ошибка входа:", error.message);
        alert(error.message);
      });
  });
});
