// js/profile.js - Полный код с функционалом редактирования и выхода

document.addEventListener("DOMContentLoaded", function () {
  // Убедимся, что Firebase сконфигурирован и доступен
  if (typeof firebase === 'undefined' || typeof firebase.auth === 'undefined' || typeof firebase.firestore === 'undefined') {
      console.error('Firebase SDK не загружен или не сконфигурирован должным образом. Профиль не будет работать.');
      // Возможно, стоит перенаправить пользователя или показать сообщение об ошибке
      return;
  }

  // Получаем экземпляры сервиса аутентификации и Firestore
  const auth = firebase.auth();
  const db = firebase.firestore();

  // Получаем ссылки на элементы для отображения и редактирования профиля
  const profileInfoSection = document.getElementById("profileInfoSection");
  const editProfileSection = document.getElementById("editProfileSection");
  const editProfileButton = document.getElementById("editProfileButton");
  const profileEditForm = document.getElementById("profile-edit-form");
  const cancelEditButton = document.getElementById("cancelEditButton");

  // Получаем ссылки на поля формы редактирования
  const editUsernameInput = document.getElementById("edit-username");
  // const editEmailInput = document.getElementById("edit-email"); // Если вы добавили поле Email

  // Получаем ссылки на элементы для отображения данных профиля
  const usernameDisplay = document.getElementById("usernameDisplay");
  const emailDisplay = document.getElementById("emailDisplay");
  const registrationDateDisplay = document.getElementById("registrationDateDisplay");
  const pollsCompletedDisplay = document.getElementById("pollsCompleted");
  const pollsCreatedDisplay = document.getElementById("pollsCreated");
  const totalPointsDisplay = document.getElementById("totalPoints");
  const commentsMadeDisplay = document.getElementById("commentsMade");

  // Получаем ссылки на элементы меню аутентификации
  const loginLink = document.getElementById('login-link');
  const registerLink = document.getElementById('register-link');
  const logoutButton = document.getElementById('logout-button');


  // Функция для обновления отображения данных профиля
  function updateProfileDisplay(userData, userAuth) {
       if (usernameDisplay) {
            usernameDisplay.textContent = userData.username || userAuth.displayName || (userAuth.email ? userAuth.email.split('@')[0] : "Без имени");
       }
       if (emailDisplay) {
            emailDisplay.textContent = userData.email || userAuth.email || "Не указан";
       }
       if (registrationDateDisplay) {
            let dateText = "Неизвестно";
            if (userData.createdAt) {
                 const date = userData.createdAt.toDate();
                 dateText = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
            } else if (userAuth.metadata && userAuth.metadata.creationTime) {
                 const date = new Date(userAuth.metadata.creationTime);
                 dateText = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
            }
            registrationDateDisplay.textContent = dateText;
       }
       if (pollsCompletedDisplay) {
            pollsCompletedDisplay.textContent = userData.pollsCompleted || 0;
       }
       if (pollsCreatedDisplay) {
            pollsCreatedDisplay.textContent = userData.pollsCreated || 0;
       }
       if (totalPointsDisplay) {
            totalPointsDisplay.textContent = userData.totalPoints || 0;
       }
       if (commentsMadeDisplay) {
            commentsMadeDisplay.textContent = userData.commentsMade || 0;
       }
  }

  // Отслеживаем состояние аутентификации пользователя
  auth.onAuthStateChanged(function (user) {
    if (user) {
      // Пользователь вошел в систему
      console.log("Пользователь вошел:", user.email, "UID:", user.uid);

      // Показываем кнопку "Выход" и скрываем "Вход/Регистрация"
      if (loginLink) loginLink.style.display = 'none';
      if (registerLink) registerLink.style.display = 'none';
      if (logoutButton) logoutButton.style.display = 'list-item'; // Или 'block'/'inline' в зависимости от вашего CSS


      // Получаем дополнительные данные пользователя из Firestore
      db.collection("users").doc(user.uid).get()
        .then(function (doc) {
          let userData = {};
          if (doc.exists) {
            userData = doc.data();
            console.log("Данные пользователя из Firestore:", userData);
            // Обновляем отображение профиля данными из Firestore и Auth
            updateProfileDisplay(userData, user);

            // Заполняем форму редактирования текущими данными
            if (editUsernameInput) {
                 editUsernameInput.value = userData.username || user.displayName || '';
            }
            // if (editEmailInput && user.email) { editEmailInput.value = user.email; } // Если поле Email есть

          } else {
            // Документ пользователя не найден в Firestore
            console.warn("Документ пользователя не найден в Firestore для UID:", user.uid);
            // Отображаем базовую информацию из объекта user
            updateProfileDisplay({}, user); // Передаем пустые данные из Firestore и объект Auth

            // Заполняем форму редактирования базовыми данными из Auth
            if (editUsernameInput) {
                 editUsernameInput.value = user.displayName || (user.email ? user.email.split('@')[0] : '');
            }
            // if (editEmailInput && user.email) { editEmailInput.value = user.email; } // Если поле Email есть

            // Можно также рассмотреть возможность создания документа пользователя здесь с базовыми данными
            // const initialUserData = {
            //      username: user.displayName || (user.email ? user.email.split('@')[0] : 'anonymous'),
            //      email: user.email || null,
            //      pollsCompleted: 0,
            //      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            // };
            // db.collection("users").doc(user.uid).set(initialUserData)
            // .then(() => console.log("Создан новый документ пользователя в Firestore"))
            // .catch(error => console.error("Ошибка при создании документа пользователя:", error));
          }
        })
        .catch(function (error) {
          console.error("Ошибка получения данных пользователя из Firestore: ", error);
          // Отображаем базовую информацию из объекта user и сообщение об ошибке
          updateProfileDisplay({}, user);
          const profileInfoSectionContent = document.querySelector('#profileInfoSection .profile-card');
          if(profileInfoSectionContent) {
               const errorMessageElement = document.createElement('p');
               errorMessageElement.style.color = 'red';
               errorMessageElement.textContent = 'Не удалось загрузить данные профиля.';
               profileInfoSectionContent.appendChild(errorMessageElement);
          }
        });

    } else {
      // Пользователь не вошел в систему
      console.log("Пользователь не вошел, перенаправление на страницу входа.");
      // Скрываем кнопку "Выход" и показываем "Вход/Регистрация"
      if (loginLink) loginLink.style.display = 'list-item'; // Или 'block'/'inline'
      if (registerLink) registerLink.style.display = 'list-item'; // Или 'block'/'inline'
      if (logoutButton) logoutButton.style.display = 'none';

      // Перенаправляем на страницу входа
      window.location.href = "/auth/login.html"; // Убедитесь, что путь правильный
    }
  });

  // Обработчик клика по кнопке "Редактировать профиль"
  if (editProfileButton && profileInfoSection && editProfileSection) {
       editProfileButton.addEventListener('click', () => {
           profileInfoSection.style.display = 'none'; // Скрываем секцию отображения
           editProfileSection.style.display = 'block'; // Показываем секцию редактирования
           // Заполнение формы уже происходит при загрузке данных пользователя в onAuthStateChanged
       });
  }

  // Обработчик клика по кнопке "Отмена"
   if (cancelEditButton && profileInfoSection && editProfileSection) {
       cancelEditButton.addEventListener('click', () => {
           editProfileSection.style.display = 'none'; // Скрываем секцию редактирования
           profileInfoSection.style.display = 'block'; // Показываем секцию отображения
           // Можно сбросить форму profileEditForm.reset(); если нужно
       });
  }

  // Обработчик отправки формы редактирования профиля
  if (profileEditForm && profileInfoSection && editProfileSection) {
      profileEditForm.addEventListener('submit', async (e) => {
          e.preventDefault(); // Отменяем стандартную отправку формы

          const newUsername = editUsernameInput ? editUsernameInput.value.trim() : null;

          if (!newUsername) {
              alert("Имя пользователя не может быть пустым.");
              return;
          }

          // Отключаем кнопки для предотвращения повторных нажатий
          const saveButton = profileEditForm.querySelector('button[type="submit"]');
          if(saveButton) saveButton.disabled = true;
          if(cancelEditButton) cancelEditButton.disabled = true;


          try {
              const user = auth.currentUser; // Получаем текущего пользователя

              if (user) {
                  // Обновляем displayName в Firebase Authentication
                  await user.updateProfile({
                      displayName: newUsername
                  });
                  console.log("displayName в Auth обновлен:", newUsername);

                  // Обновляем документ пользователя в Firestore
                  await db.collection('users').doc(user.uid).update({
                      username: newUsername
                      // Если есть другие поля для обновления, добавляем их здесь
                  });
                   console.log("Данные пользователя в Firestore обновлены.");


                  // После успешного сохранения, обновляем отображение профиля
                  // Можно повторно получить данные или просто обновить из формы/Auth
                  // Проще всего повторно получить данные из Firestore, чтобы быть уверенным
                  const updatedDoc = await db.collection("users").doc(user.uid).get();
                  if(updatedDoc.exists) {
                       updateProfileDisplay(updatedDoc.data(), user);
                  } else {
                       // На случай, если документ исчез (очень маловероятно)
                       updateProfileDisplay({}, user);
                  }


                  // Переключаем обратно на отображение профиля
                  editProfileSection.style.display = 'none';
                  profileInfoSection.style.display = 'block';

                  alert("Профиль успешно обновлен!");

              } else {
                  // Если пользователь внезапно разлогинился
                  alert("Вы не авторизованы. Пожалуйста, войдите снова.");
                  window.location.href = "/auth/login.html";
              }

          } catch (error) {
              console.error("Ошибка при обновлении профиля:", error);
              alert("Ошибка при обновлении профиля: " + error.message);

          } finally {
              // Включаем кнопки обратно
              if(saveButton) saveButton.disabled = false;
              if(cancelEditButton) cancelEditButton.disabled = false;
          }
      });
  }

  // Обработчик клика по кнопке "Выход"
  if (logoutButton) {
      logoutButton.addEventListener('click', async (e) => {
          e.preventDefault();
          try {
              await auth.signOut();
              console.log("Пользователь вышел.");
              // Перенаправляем на главную страницу или страницу входа после выхода
              window.location.href = "/index.html"; // или "/auth/login.html"
          } catch (error) {
              console.error("Ошибка при выходе:", error);
              alert("Ошибка при выходе: " + error.message);
          }
      });
  }

});