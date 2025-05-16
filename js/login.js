// js/login.js (для совместимого SDK)

document.addEventListener("DOMContentLoaded", function () {
  // Убедимся, что Firebase сконфигурирован и доступен
  // Это не строго необходимо, если firebase-config.js выполняется до этого,
  // но может служить дополнительной проверкой.
  if (typeof firebase === 'undefined' || typeof firebase.auth === 'undefined') {
      console.error('Firebase SDK не загружен или не сконфигурирован должным образом. Вход не будет работать.');
      return;
  }

  // Инициализация сервиса аутентификации (используем глобальный объект firebase)
  const auth = firebase.auth();
  // const db = firebase.firestore(); // Если Firestore нужен в этом файле

  // Получаем элемент формы входа
  const loginForm = document.getElementById("login-form");
  if (!loginForm) {
    console.error("loginForm не найден!");
    return;
  }

  // Обработка отправки формы
  loginForm.addEventListener("submit", function (e) {
    e.preventDefault(); // Отменяем стандартную отправку формы

    const email = loginForm.email.value;
    const password = loginForm.password.value;

    // Входим в систему через Firebase Authentication
    auth
      .signInWithEmailAndPassword(email, password)
      .then((userCredential) => {
        // Вход выполнен успешно
        alert("Вход выполнен успешно");
        // Перенаправляем пользователя на страницу профиля
        window.location.href = "profile.html";
      })
      .catch((error) => {
        // Обработка ошибок входа
        console.error("Ошибка входа:", error.message);
        // Отображаем сообщение об ошибке пользователю
        alert(error.message); // Или выводим в специальный блок на странице
      });
  });
});