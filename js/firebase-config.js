// js/firebase-config.js (для совместимого SDK)

// Ваши конфигурационные данные из Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyCpdDWrtc9Vq_zxMjSEtZIxaJzgDCNQhy0",
  authDomain: "polls-main-322.firebaseapp.com",
  projectId: "polls-main-322",
  storageBucket: "polls-main-322.firebasestorage.app",
  messagingSenderId: "15214177941",
  appId: "1:15214177941:web:05fd8dbb514c46d5e2b59c",
  measurementId: "G-VG4GQXFXQ9", // Этот ID нужен для Analytics, если включен
};

// Инициализация Firebase (если ещё не инициализировано)
// Используем глобальный объект firebase, предоставленный firebase-app-compat.js
// Проверка !firebase.apps.length защищает от повторной инициализации
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
} else {
    // Если уже инициализировано, можно получить существующий экземпляр по умолчанию
    // firebase.app();
}

// Установка постоянства сессии (используя глобальный объект firebase)
// Этот код устанавливает постоянство сессии для аутентификации
firebase
  .auth()
  .setPersistence(firebase.auth.Auth.Persistence.LOCAL)
  .catch(function (error) {
    // Обработка ошибок при установке постоянства (например, если в браузере отключены куки)
    console.error("Ошибка установки постоянства сессии: ", error);
  });

// В login.js, auth-google.js и register.js вы будете получать
// экземпляры auth и db через глобальный объект firebase:
// const auth = firebase.auth();
// const db = firebase.firestore();
// Убедитесь, что этот файл firebase-config.js подключен до них в HTML.