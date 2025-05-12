document.addEventListener("DOMContentLoaded", function () {
  firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
      const userRef = firebase.firestore().collection("users").doc(user.uid);

      userRef.get()
        .then(function (doc) {
          if (doc.exists) {
            const pollsCompleted = doc.data().pollsCompleted || 0;
            document.getElementById("pollsCompleted").textContent = pollsCompleted;
          } else {
            console.log("Документ пользователя не найден");
          }
        })
        .catch(function (error) {
          console.error("Ошибка получения данных пользователя: ", error);
        });

      // Подписка на изменения в реальном времени (если кто-то обновит Firestore)
      userRef.onSnapshot(function (doc) {
        if (doc.exists) {
          document.getElementById("pollsCompleted").textContent = doc.data().pollsCompleted || 0;
        }
      });

    } else {
      window.location.href = "login.html";
    }
  });
});

// Функция для обновления количества пройденных опросов после завершения опроса
function updatePollsCompleted() {
  const user = firebase.auth().currentUser;
  if (user) {
    const userRef = firebase.firestore().collection("users").doc(user.uid);

    userRef.update({
      pollsCompleted: firebase.firestore.FieldValue.increment(1)
    })
    .then(() => {
      console.log("Количество пройденных опросов обновлено");
    })
    .catch((error) => {
      console.error("Ошибка обновления количества опросов: ", error);
    });
  }
}
