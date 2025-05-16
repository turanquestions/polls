// js/admin.js
document.addEventListener('DOMContentLoaded', () => {
    const auth = firebase.auth();
    const db = firebase.firestore();

    const adminMainContent = document.getElementById('admin-main-content');
    const loadingAdminPanel = document.getElementById('loading-admin-panel');
    const accessDeniedSection = document.getElementById('access-denied-admin-panel');
    const adminPanelContent = document.getElementById('admin-panel-content');

    const createPollForm = document.getElementById('create-poll-form');
    const questionsContainer = document.getElementById('questions-container');
    const addQuestionBtn = document.getElementById('add-question-btn');
    const pollIsLockedCheckbox = document.getElementById('poll-is-locked');
    const pointsToUnlockContainer = document.getElementById('points-to-unlock-container');

    // Проверка прав администратора
    auth.onAuthStateChanged(async user => {
        if (user) {
            try {
                const userDoc = await db.collection('users').doc(user.uid).get();
                if (userDoc.exists && userDoc.data().isAdmin === true) {
                    console.log('Администратор вошел:', user.email);
                    if (loadingAdminPanel) loadingAdminPanel.style.display = 'none';
                    if (adminMainContent) adminMainContent.style.display = 'block';
                    if (adminPanelContent) adminPanelContent.style.display = 'block';
                    if (accessDeniedSection) accessDeniedSection.style.display = 'none';
                    initAdminPanel();
                } else {
                    showAccessDenied();
                }
            } catch (error) {
                console.error("Ошибка получения данных пользователя:", error);
                showAccessDenied();
            }
        } else {
            console.log('Пользователь не авторизован. Перенаправление на страницу входа.');
            // Можно перенаправить на страницу входа, если это не главная страница входа
            // window.location.href = '/auth/login.html';
            showAccessDenied(); // Или просто показать "Доступ запрещен"
        }
    });

    function showAccessDenied() {
        if (loadingAdminPanel) loadingAdminPanel.style.display = 'none';
        if (adminMainContent) adminMainContent.style.display = 'block'; // Показываем основной блок, чтобы было видно сообщение
        if (adminPanelContent) adminPanelContent.style.display = 'none';
        if (accessDeniedSection) accessDeniedSection.style.display = 'block';
    }


    function initAdminPanel() {
        // Показать/скрыть поле "Очков для разблокировки"
        if (pollIsLockedCheckbox && pointsToUnlockContainer) {
            pollIsLockedCheckbox.addEventListener('change', () => {
                pointsToUnlockContainer.style.display = pollIsLockedCheckbox.checked ? 'block' : 'none';
            });
        }

        // Добавление вопросов
        let questionCounter = 0;
        if (addQuestionBtn) {
            addQuestionBtn.addEventListener('click', () => {
                questionCounter++;
                const questionBlock = document.createElement('div');
                questionBlock.classList.add('question-block');
                questionBlock.innerHTML = `
                    <h4>Вопрос ${questionCounter}</h4>
                    <label for="q-text-${questionCounter}">Текст вопроса:</label>
                    <input type="text" id="q-text-${questionCounter}" name="q-text-${questionCounter}" required>
                    <label for="q-type-${questionCounter}">Тип вопроса:</label>
                    <select id="q-type-${questionCounter}" name="q-type-${questionCounter}" class="question-type-select">
                        <option value="radio">Одиночный выбор (radio)</option>
                        <option value="checkbox">Множественный выбор (checkbox)</option>
                        <option value="text">Текстовый ответ (скоро)</option>
                        <option value="image-radio">Одиночный выбор с картинками (скоро)</option>
                    </select>
                    <div class="options-for-question">
                        <label>Варианты ответов:</label>
                        <div class="options-list">
                            <!-- Опции будут здесь -->
                        </div>
                        <button type="button" class="add-option-btn add-btn button-style" style="font-size:0.8rem; padding: 5px 10px;">Добавить вариант</button>
                    </div>
                    <button type="button" class="remove-btn remove-question-btn" style="margin-top:10px;">Удалить вопрос</button>
                `;
                if (questionsContainer) questionsContainer.appendChild(questionBlock);

                // Обработчик для кнопки "Добавить вариант" внутри нового вопроса
                const addOptionBtnInBlock = questionBlock.querySelector('.add-option-btn');
                const optionsListDiv = questionBlock.querySelector('.options-list');
                let optionCounterForQuestion = 0;

                if (addOptionBtnInBlock && optionsListDiv) {
                    addOptionBtnInBlock.addEventListener('click', () => {
                        optionCounterForQuestion++;
                        const optionDiv = document.createElement('div');
                        optionDiv.classList.add('option-block');
                        optionDiv.style.marginBottom = '5px';
                        // TODO: Добавить поле для URL картинки, если тип image-radio
                        optionDiv.innerHTML = `
                            <input type="text" placeholder="Текст варианта ${optionCounterForQuestion}" name="q-${questionCounter}-option-text-${optionCounterForQuestion}" required>
                            <input type="text" placeholder="Значение (value)" name="q-${questionCounter}-option-value-${optionCounterForQuestion}" style="width:100px; margin-right:5px;" required>
                            <button type="button" class="remove-btn remove-option-btn">X</button>
                        `;
                        optionsListDiv.appendChild(optionDiv);
                        optionDiv.querySelector('.remove-option-btn').addEventListener('click', () => optionDiv.remove());
                    });
                    // Добавляем сразу 2 варианта по умолчанию для удобства
                    addOptionBtnInBlock.click();
                    addOptionBtnInBlock.click();
                }
                 questionBlock.querySelector('.remove-question-btn').addEventListener('click', () => questionBlock.remove());
            });
            // Добавляем первый вопрос по умолчанию
            addQuestionBtn.click();
        }


        // Обработка отправки формы создания опроса
        if (createPollForm) {
            createPollForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const currentUser = auth.currentUser;
                if (!currentUser) {
                    alert('Ошибка: Пользователь не авторизован.');
                    return;
                }

                const pollTitle = document.getElementById('poll-title').value;
                const pollDescription = document.getElementById('poll-description').value;
                const pollCategory = document.getElementById('poll-category').value;
                const pollPointsCompletion = parseInt(document.getElementById('poll-points-completion').value, 10);
                const pollIsLocked = document.getElementById('poll-is-locked').checked;
                const pollPointsUnlock = pollIsLocked ? parseInt(document.getElementById('poll-points-unlock').value, 10) : 0;

                const questions = [];
                const questionBlocks = questionsContainer.querySelectorAll('.question-block');

                questionBlocks.forEach((qBlock, qIndex) => {
                    const questionText = qBlock.querySelector(`input[name="q-text-${qIndex + 1}"]`).value;
                    const questionType = qBlock.querySelector(`select[name="q-type-${qIndex + 1}"]`).value;
                    const options = [];
                    const optionBlocks = qBlock.querySelectorAll('.option-block');
                    optionBlocks.forEach((optBlock, optIndex) => {
                        const optionText = optBlock.querySelector(`input[name="q-${qIndex + 1}-option-text-${optIndex + 1}"]`).value;
                        const optionValue = optBlock.querySelector(`input[name="q-${qIndex + 1}-option-value-${optIndex + 1}"]`).value;
                        options.push({
                            id: `opt${qIndex + 1}_${optIndex + 1}`, // Генерируем ID для опции
                            text: optionText,
                            value: optionValue
                            // TODO: imageUrl: (если тип image-radio)
                        });
                    });
                    questions.push({
                        id: `q${qIndex + 1}`, // Генерируем ID для вопроса
                        text: questionText,
                        type: questionType,
                        options: options
                    });
                });

                if (questions.length === 0) {
                    alert('Добавьте хотя бы один вопрос!');
                    return;
                }

                const newPoll = {
                    title: pollTitle,
                    description: pollDescription,
                    category: pollCategory,
                    pointsForCompletion: pollPointsCompletion,
                    isLocked: pollIsLocked,
                    pointsToUnlock: pollPointsUnlock,
                    questions: questions,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    authorId: currentUser.uid, // ID администратора, создавшего опрос
                    totalCompletions: 0 // Счетчик прохождений опроса
                };

                try {
                    const docRef = await db.collection('polls').add(newPoll);
                    console.log('Опрос успешно создан с ID:', docRef.id);
                    alert('Опрос успешно создан!');

                    // Обновляем счетчик созданных опросов у админа
                    const userRef = db.collection('users').doc(currentUser.uid);
                    await userRef.update({
                        pollsCreated: firebase.firestore.FieldValue.increment(1)
                    });
                    console.log('Счетчик созданных опросов обновлен для админа.');

                    createPollForm.reset(); // Сброс формы
                    questionsContainer.innerHTML = ''; // Очистка контейнера вопросов
                    questionCounter = 0; // Сброс счетчика вопросов
                    addQuestionBtn.click(); // Добавляем снова первый пустой вопрос
                    if (pollIsLockedCheckbox) pollIsLockedCheckbox.checked = false;
                    if (pointsToUnlockContainer) pointsToUnlockContainer.style.display = 'none';

                } catch (error) {
                    console.error('Ошибка создания опроса:', error);
                    alert('Ошибка создания опроса: ' + error.message);
                }
            });
        }
    } // конец initAdminPanel
});