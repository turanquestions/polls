// При загрузке страницы устанавливаем первый вопрос активным
document.addEventListener("DOMContentLoaded", function () {
  const questionSections = document.querySelectorAll(".question-section");
  if (questionSections.length > 0) {
    questionSections[0].classList.add("active");
  }

  // Добавляем обработчики события "change" для радио-кнопок в каждом вопросе
  questionSections.forEach((section, index) => {
    const inputs = section.querySelectorAll('input[type="radio"]');
    inputs.forEach((input) => {
      input.addEventListener("change", function () {
        // Задержка для визуального эффекта выбора
        setTimeout(function () {
          goToNextQuestion(index);
        }, 300);
      });
    });
  });
});

// Функция для переключения на следующий вопрос
function goToNextQuestion(currentIndex) {
  const questionSections = document.querySelectorAll(".question-section");
  questionSections[currentIndex].classList.remove("active");
  if (currentIndex + 1 < questionSections.length) {
    questionSections[currentIndex + 1].classList.add("active");
  } else {
    // Если вопросов больше нет, показываем результат
    submitPoll();
  }
}

// Функция для обработки завершения опроса
function submitPoll() {
  // Скрываем форму опроса и показываем блок с результатом
  document.getElementById("poll-form").style.display = "none";
  document.getElementById("result").style.display = "block";
  document.getElementById("score").textContent = "Ваш результат: ...";

  // Получаем текущего пользователя
  const user = firebase.auth().currentUser;
  if (user) {
    // Обновляем поле pollsCompleted для текущего пользователя
    firebase
      .firestore()
      .collection("users")
      .doc(user.uid)
      .update({
        pollsCompleted: firebase.firestore.FieldValue.increment(1),
      })
      .then(() => {
        console.log("Количество пройденных опросов обновлено");
        alert("Опрос успешно завершён!");
      })
      .catch((error) => {
        console.error("Ошибка обновления количества опросов: ", error);
        alert("Ошибка обновления статистики: " + error.message);
      });
  } else {
    console.error("Пользователь не авторизован");
    alert("Ошибка: Пользователь не авторизован!");
  }
}

// Функция переключения бокового меню
function toggleMenu() {
  const menu = document.getElementById("side-menu");
  const toggleButton = document.querySelector(".menu-toggle");
  const isOpen = menu.classList.toggle("open");
  toggleButton.setAttribute("aria-expanded", isOpen);
}
