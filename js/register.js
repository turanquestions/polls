// js/register.js (для совместимого SDK)

// Обернем весь код в DOMContentLoaded, чтобы форма точно была загружена
document.addEventListener("DOMContentLoaded", function () {
  // Убедимся, что Firebase сконфигурирован и доступен
  // Это проверка на случай, если firebase-config.js или SDK не загрузились.
  if (typeof firebase === 'undefined' || typeof firebase.auth === 'undefined' || typeof firebase.firestore === 'undefined') {
      console.error('Firebase SDK не загружен или не сконфигурирован должным образом. Регистрация не будет работать.');
      return;
  }

  // Инициализация сервисов (используем глобальный объект firebase,
  // который должен быть инициализирован в firebase-config.js)
  const auth = firebase.auth();
  const db = firebase.firestore(); // Нужен для сохранения дополнительных данных пользователя

  const registerForm = document.getElementById("register-form");
  if (!registerForm) {
    console.error("registerForm не найден!");
    return;
  }

  registerForm.addEventListener("submit", function (e) {
    e.preventDefault(); // Отменяем стандартную отправку формы

    const username = registerForm.username.value;
    const email = registerForm.email.value;
    const password = registerForm.password.value;

    // Проверяем, что email, password и username не пустые (базовая валидация)
    if (!email || !password || !username) {
        alert("Пожалуйста, заполните все поля.");
        return;
    }

    // Создаем нового пользователя с email и паролем
    auth
      .createUserWithEmailAndPassword(email, password)
      .then((userCredential) => {
        // Пользователь успешно создан в Firebase Authentication
        const user = userCredential.user;
        console.log("Пользователь успешно зарегистрирован в Auth:", user.email);

        // Сохраняем дополнительные данные пользователя в Firestore
        return db.collection("users").doc(user.uid).set({
            username: username,
            email: user.email, // Используем email из userCredential для надежности
            pollsCompleted: 0, // Начальное значение
            createdAt: firebase.firestore.FieldValue.serverTimestamp(), // Дата создания на сервере
            // Можно добавить другие поля по умолчанию
        });
      })
      .then(() => {
        // Данные пользователя успешно сохранены в Firestore
        alert("Регистрация прошла успешно!");
        // Перенаправляем пользователя на страницу профиля или главную
        window.location.href = "profile.html"; // или index.html
      })
      .catch((error) => {
        // Обработка ошибок регистрации (например, email уже используется, слабый пароль)
        console.error("Ошибка регистрации:", error.message);

        let userErrorMessage = "Ошибка при регистрации. Пожалуйста, попробуйте еще раз.";
        if (error.code === 'auth/email-already-in-use') {
            userErrorMessage = "Этот email уже используется.";
        } else if (error.code === 'auth/invalid-email') {
            userErrorMessage = "Некорректный формат email.";
        } else if (error.code === 'auth/weak-password') {
            userErrorMessage = "Пароль слишком слабый (минимум 6 символов).";
        }
        // Отображаем сообщение об ошибке пользователю
        alert(userErrorMessage); // Или выводим в специальный блок на странице
      });
  });
});