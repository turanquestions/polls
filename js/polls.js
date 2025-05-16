// js/polls.js

// Этот скрипт содержит логику, связанную с аутентификацией пользователя,
// отображением счетчика пройденных опросов (если соответствующий элемент есть на странице),
// и функцию для увеличения этого счетчика в Firestore.

// Обертываем основной код в DOMContentLoaded, чтобы элементы страницы были загружены.
document.addEventListener("DOMContentLoaded", function () {

    // Слушатель состояния аутентификации Firebase.
    // Этот блок выполняется при изменении статуса входа пользователя (войшел/вышел/статус определен).
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            // Пользователь вошел в систему.
            console.log("Пользователь аутентифицирован в polls.js:", user.email || "UID: " + user.uid);

            // Получаем ссылку на документ пользователя в коллекции 'users' по его UID.
            const userRef = firebase.firestore().collection("users").doc(user.uid);

            // --- Логика получения и отображения счетчика пройденных опросов (вероятно, для страницы профиля) ---
            // Элемент с ID 'pollsCompleted' должен существовать на странице, где выполняется этот код,
            // если вы хотите отобразить этот счетчик.
            const pollsCompletedElement = document.getElementById("pollsCompleted");

            // Получаем данные пользователя один раз при загрузке страницы/изменении статуса.
            userRef.get()
                .then(function (doc) {
                    if (doc.exists) {
                        // Документ пользователя найден в Firestore.
                        const pollsCompleted = doc.data().pollsCompleted || 0;
                        // Пытаемся обновить элемент #pollsCompleted, если он существует на текущей странице.
                        if (pollsCompletedElement) { // Проверка: существует ли элемент на этой странице?
                            pollsCompletedElement.textContent = pollsCompleted;
                        } else {
                            // Если элемента нет на этой странице, просто выводим предупреждение в консоль.
                            // Это нормально для страниц, кроме страницы профиля, где этот элемент ожидается.
                            console.warn("Элемент с ID 'pollsCompleted' не найден на этой странице для отображения счетчика.");
                        }
                    } else {
                        // Документ пользователя не найден (это редкость для вошедшего пользователя).
                        console.log("Документ пользователя не найден в Firestore для UID:", user.uid);
                        // В этом случае счетчик не отображается или остается значение по умолчанию.
                    }
                })
                .catch(function (error) {
                    // Обработка ошибки при получении документа пользователя.
                    console.error("Ошибка получения данных пользователя из Firestore:", error);
                });

            // --- Подписка на изменения в реальном времени (если данные пользователя обновятся в Firestore) ---
            // Эта подписка будет автоматически обновлять отображение счетчика,
            // если кто-то (например, другая вкладка браузера или другой код) изменит pollsCompleted в Firestore.
            userRef.onSnapshot(function (doc) {
                 // Этот блок выполняется при любых изменениях в документе пользователя в Firestore.
                if (doc.exists) {
                    // Обновляем отображение счетчика пройденных опросов в реальном времени, если элемент существует.
                    const pollsCompleted = doc.data().pollsCompleted || 0;
                     if (pollsCompletedElement) { // Проверка: существует ли элемент на этой странице?
                         pollsCompletedElement.textContent = pollsCompleted;
                     }
                } else {
                    // Если документ удален (что маловероятно при нормальной работе).
                     console.log("Документ пользователя удален в Firestore (обновление в реальном времени).");
                     if (pollsCompletedElement) { // Если элемент был, можно его сбросить
                         pollsCompletedElement.textContent = 0;
                     }
                }
            }, function(error) {
                // Обработка ошибок подписки на изменения.
                console.error("Ошибка подписки на изменения документа пользователя:", error);
            });

            // --- Место для основной логики опроса на этой странице ---
            // Здесь должен находиться код, который управляет формой опроса,
            // переключает вопросы, собирает ответы и обрабатывает отправку формы.

            const pollForm = document.getElementById('poll-form'); // Получаем форму опроса

            if (pollForm) { // Убедимся, что форма опроса существует на этой странице.
                 console.log("Форма опроса найдена.");
                // *** Добавьте сюда логику работы формы опроса ***
                // Например:
                // const questionSections = document.querySelectorAll('.question-section');
                // const prevButton = document.getElementById('prev-question-btn');
                // const nextButton = document.getElementById('next-question-btn');
                // const submitButton = document.getElementById('submit-poll-btn');
                // const resultDiv = document.getElementById('result');

                // Логика отображения/скрытия вопросов, кнопок навигации.
                // Обработчик события submit для формы pollForm.
                // Внутри submit обработчика, после успешного завершения опроса и,
                // возможно, отправки ответов в Firestore, вызовите функцию updatePollsCompleted().

                // Пример: Обработчик отправки формы
                // pollForm.addEventListener('submit', function(e) {
                //    e.preventDefault();
                //    // 1. Собрать ответы пользователя из формы.
                //    // 2. Выполнить логику обработки ответов (подсчет результата, сохранение).
                //    // 3. Если нужно сохранить результат опроса в Firestore или связать его с пользователем:
                //    //    Используйте user.uid и userRef.
                //    // 4. После успешного завершения опроса (и сохранения, если нужно):
                //    //    Вызовите updatePollsCompleted(); // Увеличит счетчик в документе пользователя
                //    // 5. Отобразить блок с результатом (resultDiv).
                //    //    resultDiv.style.display = 'block';
                //    //    document.getElementById('score').textContent = 'Ваш результат: ...'; // Отобразить результат
                //    //    Скрыть форму опроса.
                // });

            } else {
                 console.warn("Форма опроса (#poll-form) не найдена на этой странице.");
            }


        } else {
            // Пользователь вышел из системы или не вошел.
            console.log("Пользователь не вошел. Перенаправление на страницу входа.");
            // Перенаправляем на страницу входа. Используйте абсолютный путь для надежности.
            window.location.href = "/auth/login.html"; // Исправлен путь
        }
    });

    // --- Функция для обновления количества пройденных опросов в Firestore ---
    // Эта функция находится вне DOMContentLoaded, чтобы ее можно было вызвать из любой части
    // вашего скрипта polls.js (например, из обработчика отправки формы опроса),
    // после того как пользователь успешно завершил опрос.
    // Она НЕ зависит от загрузки DOM, только от инициализации Firebase.
    // Но ее вызов обычно происходит после действий пользователя на DOM.
    // Убедитесь, что Firebase инициализирован перед ее вызовом (это гарантируется подключением firebase-config.js).

    // Она увеличивает поле 'pollsCompleted' в документе текущего пользователя на 1.
    window.updatePollsCompleted = function() { // Делаем функцию доступной глобально или через window, если нужно вызвать ее из другого скрипта
         const user = firebase.auth().currentUser; // Получаем текущего вошедшего пользователя
         if (user) {
            const userRef = firebase.firestore().collection("users").doc(user.uid); // Получаем ссылку на документ пользователя

            // Используем атомарное увеличение поля на сервере.
            userRef.update({
                pollsCompleted: firebase.firestore.FieldValue.increment(1)
            })
            .then(() => {
                // Успешное обновление в Firestore.
                console.log("Количество пройденных опросов в Firestore успешно увеличено для UID:", user.uid);
                // Отображение на странице (если элемент #pollsCompleted существует)
                // обновится автоматически через onSnapshot слушатель выше.
            })
            .catch((error) => {
                // Обработка ошибки при обновлении.
                console.error("Ошибка обновления количества опросов в Firestore:", error);
                // Можно уведомить пользователя об ошибке.
            });
         } else {
            // Если функция вызвана, но пользователь не вошел.
            console.warn("Попытка увеличить счетчик опросов, но пользователь не вошел.");
            // Возможно, нужно предложить пользователю войти или выполнить опрос без авторизации.
         }
    };


    // --- Дополнительная логика опроса (например, для пошагового отображения вопросов) ---
    // Этот код также должен быть внутри DOMContentLoaded.
    // Пример:
    // const questionSections = document.querySelectorAll('.question-section');
    // const prevButton = document.getElementById('prev-question-btn');
    // const nextButton = document.getElementById('next-question-btn');
    // const submitButton = document.getElementById('submit-poll-btn');

    // if (questionSections.length > 0) {
    //     questionSections[0].classList.add('active'); // Показываем первый вопрос
    //     if (prevButton) prevButton.style.display = 'none'; // Скрываем кнопку "Назад" для первого вопроса

    //     // Добавление обработчиков кликов для кнопок навигации
    //     // if (nextButton) { ... addEventListener ... }
    //     // if (prevButton) { ... addEventListener ... }
    //     // if (submitButton) { ... addEventListener ... } // Обработчик для кнопки "Завершить"
    // }


}); // Конец DOMContentLoaded