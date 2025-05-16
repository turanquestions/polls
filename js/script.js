// script.js

document.addEventListener('DOMContentLoaded', () => {
    // --- ОБЩИЕ ФУНКЦИИ САЙТА ---

    // 1. Управление боковым меню (улучшенная версия)
    const menuToggle = document.getElementById('menuToggle');
    const sideMenu = document.getElementById('side-menu');
    const overlay = document.getElementById('overlay'); // Оверлей для затемнения фона
    // const contentWrapper = document.querySelector('.content-wrapper'); // Если нужен сдвиг контента

    if (menuToggle && sideMenu && overlay) {
        const toggleMenuVisibility = (open) => {
            menuToggle.setAttribute('aria-expanded', open);
            sideMenu.classList.toggle('open', open);
            overlay.classList.toggle('active', open);
            document.body.classList.toggle('side-menu-open', open); // Для стилей на body (например, no-scroll)

            // Опционально: сдвиг контента (если используется)
            // if (contentWrapper) {
            //     if (open && window.innerWidth < 769) { // Пример условия для мобильных
            //         contentWrapper.style.marginLeft = getComputedStyle(document.documentElement).getPropertyValue('--side-menu-width');
            //     } else {
            //         contentWrapper.style.marginLeft = '0';
            //     }
            // }
        };

        menuToggle.addEventListener('click', () => {
            const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
            toggleMenuVisibility(!isExpanded);
        });

        overlay.addEventListener('click', () => {
            toggleMenuVisibility(false);
        });

        // Закрытие меню по клавише Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && sideMenu.classList.contains('open')) {
                toggleMenuVisibility(false);
            }
        });
    }

    // 2. Установка текущего года в подвале
    const currentYearSpan = document.getElementById('currentYear');
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }

    // 3. Плавная прокрутка для якорных ссылок
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const hrefAttribute = this.getAttribute('href');
            if (hrefAttribute && hrefAttribute.length > 1) { // Убедимся, что это не просто "#"
                try {
                    const targetElement = document.querySelector(hrefAttribute);
                    if (targetElement) {
                        e.preventDefault();
                        targetElement.scrollIntoView({
                            behavior: 'smooth'
                        });
                    }
                } catch (error) {
                    console.warn(`Не удалось найти элемент для якоря: ${hrefAttribute}`, error);
                }
            } else if (hrefAttribute === '#') {
                e.preventDefault(); // Предотвращаем переход по пустым ссылкам
            }
        });
    });

    // 4. Активная ссылка в боковом меню (улучшенный вариант)
    if (sideMenu) {
        const currentFullUrl = window.location.href;
        const navLinks = sideMenu.querySelectorAll('ul li a');

        navLinks.forEach(link => {
            if (link.href === currentFullUrl) {
                link.classList.add('active');
                // Можно добавить логику для раскрытия родительских dropdown, если они есть
            } else {
                link.classList.remove('active');
            }
        });
    }


    // 5. Обработка формы подписки (пример)
    const subscribeForm = document.getElementById('subscribe-form');
    if (subscribeForm) {
        subscribeForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const emailInput = document.getElementById('subscribe-email');
            if (emailInput && emailInput.value) {
                // Здесь может быть AJAX-запрос на сервер
                alert(`Спасибо за подписку, ${emailInput.value}! Мы будем держать вас в курсе.`);
                emailInput.value = ''; // Очистить поле
            } else {
                alert('Пожалуйста, введите ваш email.');
            }
        });
    }

    // --- УПРАВЛЕНИЕ ТЕМОЙ ---
    const themeSwitcher = document.getElementById('themeSwitcher');
    const currentTheme = localStorage.getItem('theme');

    // Функция для применения темы
    const applyTheme = (themeName) => {
        document.body.classList.toggle('dark-theme', themeName === 'dark');
        // Обновляем aria-label для кнопки, если нужно
        if (themeSwitcher) {
            themeSwitcher.setAttribute('aria-label', themeName === 'dark' ? 'Переключить на светлую тему' : 'Переключить на темную тему');
        }
    };

    // Применить сохраненную тему при загрузке
    if (currentTheme) {
        applyTheme(currentTheme);
    } else {
        // Если тема не сохранена, можно установить тему по умолчанию (например, по системным настройкам)
        // const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        // if (prefersDark) applyTheme('dark');
        // else applyTheme('light'); // или просто оставить светлую по умолчанию
        applyTheme('light'); // По умолчанию светлая
    }

    if (themeSwitcher) {
        themeSwitcher.addEventListener('click', () => {
            let newTheme;
            if (document.body.classList.contains('dark-theme')) {
                newTheme = 'light';
            } else {
                newTheme = 'dark';
            }
            applyTheme(newTheme);
            localStorage.setItem('theme', newTheme);
        });
    }

    // --- УПРАВЛЕНИЕ СОСТОЯНИЕМ АУТЕНТИФИКАЦИИ И КНОПКАМИ ---
    if (typeof firebase !== 'undefined'
        && typeof firebase.auth === 'function'
        && typeof firebase.firestore === 'function' // <--- ИСПРАВЛЕНО
       ) {

        // Если все доступно, получаем экземпляры сервисов
        const auth = firebase.auth();
        const db = firebase.firestore(); // db теперь будет объектом экземпляра Firestore

        const navLoginItem = document.getElementById('nav-login-item');
        const navRegisterItem = document.getElementById('nav-register-item');
        const navProfileItem = document.getElementById('nav-profile-item');
        const navAdminPanelItem = document.getElementById('nav-admin-panel-item'); // Элемент списка <li>
        const navAdminPanelLink = document.getElementById('nav-admin-panel-link'); // Элемент ссылки <a> (если нужен прямой доступ к ссылке)
        const navLogoutItem = document.getElementById('nav-logout-item');
        const logoutLink = document.getElementById('logout-link');
        const authSectionTitle = document.getElementById('auth-section-title'); // Заголовок секции "Аккаунт"

        // Единый слушатель изменений состояния аутентификации
        auth.onAuthStateChanged(async user => { // Делаем функцию асинхронной для await db.get()

            // --- ЛОГИКА ИЗ ПЕРВОГО БЛОКА (ПОКАЗ/СКРЫТИЕ ОСНОВНЫХ ССЫЛОК АУТЕНТИФИКАЦИИ) ---
            if (user) {
                // Пользователь вошел
                console.log('Пользователь вошел:', user.email);
                if (navLoginItem) navLoginItem.style.display = 'none';
                if (navRegisterItem) navRegisterItem.style.display = 'none';
                if (navProfileItem) navProfileItem.style.display = 'list-item';
                if (navLogoutItem) navLogoutItem.style.display = 'list-item';
                 // Изначально скрываем админку, пока не проверим права ниже
                 if (navAdminPanelItem) navAdminPanelItem.style.display = 'none';

                // --- ЛОГИКА ИЗ ВТОРОГО БЛОКА (ПРОВЕРКА АДМИН-ПРАВ И ПОКАЗ ССЫЛКИ НА АДМИНКУ) ---
                // Этот код выполняется ТОЛЬКО если user существует (т.е. пользователь вошел)
                const NavAdminPanelLink = document.getElementById('nav-admin-panel-link'); // Получаем ссылку здесь, если она нужна внутри этого блока
                try {
                     // db доступно здесь, т.к. объявлено выше в этом же if блоке
                    const userDoc = await db.collection('users').doc(user.uid).get();
                    // Проверяем, существует ли документ и есть ли в нем isAdmin === true (булево!)
                    if (userDoc.exists && userDoc.data().isAdmin === true) {
                        console.log("Пользователь является администратором.");
                        // Используем navAdminPanelItem, т.к. он LI элемент меню
                        if (navAdminPanelItem) navAdminPanelItem.style.display = 'list-item'; // Показываем LI элемент админки
                    } else {
                        console.log("Пользователь не является администратором.");
                         // Скрываем LI элемент админки (уже скрыли выше, если user есть, но не админ)
                    }
                } catch (error) {
                    console.error("Ошибка проверки прав администратора:", error);
                     // При ошибке также скрываем админку
                    if (navAdminPanelItem) navAdminPanelItem.style.display = 'none';
                }
                // --- КОНЕЦ ЛОГИКИ ИЗ ВТОРОГО БЛОКА ---

            } else {
                // --- Пользователь не вошел (ЛОГИКА ИЗ ПЕРВОГО БЛОКА) ---
                console.log('Пользователь не вошел.');
                if (navLoginItem) navLoginItem.style.display = 'list-item';
                if (navRegisterItem) navRegisterItem.style.display = 'list-item';
                if (navProfileItem) navProfileItem.style.display = 'none';
                if (navLogoutItem) navLogoutItem.style.display = 'none';
                 // Всегда скрываем админку, если пользователь не вошел
                if (navAdminPanelItem) navAdminPanelItem.style.display = 'none';
            }

             // Опционально: управляем видимостью заголовка секции "Аккаунт"
             // if (authSectionTitle) {
             //     if (user || navLoginItem?.style.display !== 'none' || navRegisterItem?.style.display !== 'none') {
             //          authSectionTitle.style.display = 'list-item';
             //     } else {
             //          authSectionTitle.style.display = 'none';
             //     }
             // }
        });

        // Обработчик выхода пользователя (использует auth из этой же области видимости)
        if (logoutLink) {
            logoutLink.addEventListener('click', async (e) => { // Делаем асинхронной
                e.preventDefault();
                try {
                     await auth.signOut();
                     console.log('Пользователь вышел успешно.');
                     // Перенаправление после выхода
                     window.location.href = '/index.html';
                } catch (error) {
                     console.error('Ошибка выхода:', error);
                     alert('Произошла ошибка при выходе: ' + error.message);
                }
            });
        }

    } else {
        // Если Firebase SDK не загружен или не сконфигурирован как Compatible API
        console.warn('Firebase SDK (совместимый API) не загружен или не сконфигурирован. Функционал аутентификации и Firestore будет недоступен.');
        // Скрываем все элементы меню, связанные с аутентификацией и админкой
        const authRelatedItems = ['nav-login-item', 'nav-register-item', 'nav-profile-item', 'nav-logout-item', 'nav-admin-panel-item', 'auth-section-title'];
        authRelatedItems.forEach(id => {
            const item = document.getElementById(id);
            if (item) item.style.display = 'none';
        });
    }
    // --- КОНЕЦ УПРАВЛЕНИЯ СОСТОЯНИЕМ АУТЕНТИФИКАЦИИ ---

    // --- ЛОГИКА ДЛЯ СТРАНИЦ ОПРОСОВ ---
    const pollFormContainer = document.getElementById('poll-form-container'); // Контейнер всей формы опроса
    const questionSections = document.querySelectorAll(".question-section");
    const resultSection = document.getElementById("result"); // Секция с результатами

    if (pollFormContainer && questionSections.length > 0) {
        let currentQuestionIndex = 0;

        const setActiveQuestion = (index) => {
            questionSections.forEach((section, i) => {
                section.classList.toggle('active', i === index);
            });
        };

        // Инициализация: показываем первый вопрос
        setActiveQuestion(currentQuestionIndex);

        // Добавляем обработчики для автоматического перехода при выборе ответа
        questionSections.forEach((section, index) => {
            const inputs = section.querySelectorAll('input[type="radio"], input[type="checkbox"]'); // Поддержка и checkbox
            inputs.forEach((input) => {
                input.addEventListener("change", function () {
                    // Если это radio, то сразу переходим
                    if (input.type === "radio") {
                        // Задержка для визуального эффекта выбора
                        setTimeout(() => {
                            goToNextQuestionHandler(index);
                        }, 300); // 300ms задержка
                    }
                    // Для checkbox автоматический переход может быть не нужен,
                    // или нужен по кнопке "Далее"
                });
            });
        });

        // Функция для переключения на следующий вопрос (используется обработчиком)
        const goToNextQuestionHandler = (currentIndex) => {
            if (currentIndex + 1 < questionSections.length) {
                currentQuestionIndex = currentIndex + 1;
                setActiveQuestion(currentQuestionIndex);
            } else {
                // Если вопросов больше нет, показываем результат
                submitPollHandler();
            }
        };

        // Кнопки навигации (если они есть)
        const nextButton = document.getElementById('next-question-btn');
        const prevButton = document.getElementById('prev-question-btn');
        const submitButton = document.getElementById('submit-poll-btn'); // Кнопка для отправки всего опроса

        if (nextButton) {
            nextButton.addEventListener('click', () => {
                if (currentQuestionIndex < questionSections.length - 1) {
                    currentQuestionIndex++;
                    setActiveQuestion(currentQuestionIndex);
                } else if (currentQuestionIndex === questionSections.length - 1 && submitButton) {
                    // Если это последний вопрос и есть отдельная кнопка Submit
                    // Можно скрыть Next и показать Submit, или просто ничего не делать,
                    // так как submitPollHandler вызовется по кнопке Submit
                }
            });
        }

        if (prevButton) {
            prevButton.addEventListener('click', () => {
                if (currentQuestionIndex > 0) {
                    currentQuestionIndex--;
                    setActiveQuestion(currentQuestionIndex);
                }
            });
        }
        
        if (submitButton) {
            submitButton.addEventListener('click', () => {
                 // Проверка, все ли обязательные вопросы отвечены (если нужно)
                submitPollHandler();
            });
        }


        // Функция для обработки завершения опроса
        const submitPollHandler = () => {
            const pollForm = document.getElementById("poll-form"); // Внутренняя форма с вопросами

            if (pollForm) pollForm.style.display = "none"; // Скрываем блок с вопросами
            if (pollFormContainer) pollFormContainer.style.display = "none"; // Скрываем весь контейнер формы
            if (resultSection) resultSection.style.display = "block"; // Показываем блок с результатом

            const scoreDisplay = document.getElementById("score");
            if (scoreDisplay) {
                // Здесь должна быть логика подсчета результатов
                // Например, собрать все выбранные ответы:
                const formData = new FormData(pollForm);
                let userScore = 0;
                // Пример подсчета (зависит от структуры ваших вопросов и ответов)
                // for (let [name, value] of formData.entries()) {
                //     console.log(`Вопрос: ${name}, Ответ: ${value}`);
                //     // Логика начисления баллов
                // }
                scoreDisplay.textContent = "Ваш результат: Обработка..."; // Заменить на реальный подсчет
            }

            // Проверка, инициализирован ли Firebase
            if (typeof firebase !== 'undefined' && firebase.auth && firebase.firestore) {
                const user = firebase.auth().currentUser;
                if (user) {
                    const db = firebase.firestore();
                    db.collection("users")
                        .doc(user.uid)
                        .update({
                            pollsCompleted: firebase.firestore.FieldValue.increment(1),
                            // Можно также сохранять ответы пользователя или ID опроса
                        })
                        .then(() => {
                            console.log("Количество пройденных опросов обновлено для пользователя:", user.uid);
                            if (scoreDisplay) scoreDisplay.textContent += " Статистика обновлена!";
                            // alert("Опрос успешно завершён и ваша статистика обновлена!"); // Можно заменить на более мягкое уведомление
                        })
                        .catch((error) => {
                            console.error("Ошибка обновления количества опросов: ", error);
                            if (scoreDisplay) scoreDisplay.textContent += " Ошибка обновления статистики.";
                            // alert("Опрос завершён, но произошла ошибка при обновлении вашей статистики: " + error.message);
                        });
                } else {
                    console.warn("Пользователь не авторизован. Статистика не будет обновлена.");
                    if (scoreDisplay) scoreDisplay.textContent += " Вы не авторизованы, статистика не сохранена.";
                    // alert("Опрос завершён! Войдите в систему, чтобы сохранить ваш прогресс.");
                }
            } else {
                console.warn("Firebase SDK не загружен или не сконфигурирован. Статистика не будет обновлена.");
                if (scoreDisplay) scoreDisplay.textContent += " Ошибка конфигурации сервера.";
            }
        };
    } // Конец блока if (pollFormContainer && questionSections.length > 0)
}); // Конец DOMContentLoaded