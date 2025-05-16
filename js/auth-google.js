// js/auth-google.js (для совместимого SDK)

document.addEventListener('DOMContentLoaded', () => {
    if (typeof firebase === 'undefined' || typeof firebase.auth === 'undefined' || typeof firebase.firestore === 'undefined') {
        console.error('Firebase SDK не загружен или не сконфигурирован должным образом. Вход через Google не будет работать.');
        return;
    }

    const auth = firebase.auth();
    const db = firebase.firestore();

    const handleGoogleSignIn = async () => {
        const provider = new firebase.auth.GoogleAuthProvider();

        // Можно добавить кастомные параметры, если нужно, например, для запроса определенных данных
        // provider.addScope('profile');
        // provider.addScope('email');

        try {
            const result = await auth.signInWithPopup(provider);
            const user = result.user;

            // Можно получить токен Google, если он нужен для чего-то еще
            // const credential = result.credential;
            // const token = credential.accessToken;

            console.log('Успешный вход через Google:', user.displayName, user.email);

            if (result.additionalUserInfo && result.additionalUserInfo.isNewUser) {
                console.log('Новый пользователь через Google, создаем запись в Firestore...');
                await db.collection('users').doc(user.uid).set({
                    username: user.displayName || (user.email ? user.email.split('@')[0] : 'anonymous'),
                    email: user.email || null,
                    photoURL: user.photoURL || null,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    pollsCompleted: 0,
                });
                console.log('Запись для нового пользователя создана в Firestore.');
            }

            // Перенаправляем на страницу профиля или главную
            // Убедитесь, что пути правильные
            window.location.href = '/profile.html'; // или '/index.html'

        } catch (error) {
            console.error('Ошибка входа через Google:', error);

            // Обработка распространенных ошибок
            let errorMessage = 'Произошла ошибка при входе через Google. Пожалуйста, попробуйте еще раз.';
            if (error.code === 'auth/account-exists-with-different-credential') {
                errorMessage = 'Аккаунт с таким email уже существует, но с другим способом входа. Попробуйте войти, используя другой метод.';
                // Можно предложить пользователю связать аккаунты, но это более сложная логика
            } else if (error.code === 'auth/popup-closed-by-user') {
                errorMessage = 'Окно входа было закрыто. Пожалуйста, попробуйте еще раз.';
            } else if (error.code === 'auth/cancelled-popup-request') {
                errorMessage = 'Запрос на вход был отменен. Пожалуйста, попробуйте еще раз.';
            }
            // Отобразите errorMessage пользователю (например, через alert или специальный блок на странице)
            alert(errorMessage);
        }
    };

    // Назначаем обработчик на кнопку входа на странице логина
    const googleSignInBtnLogin = document.getElementById('google-signin-btn-login');
    if (googleSignInBtnLogin) {
        googleSignInBtnLogin.addEventListener('click', handleGoogleSignIn);
    }

    // Если есть кнопка на странице регистрации, можно назначить и на нее (у вас в login.html ее нет, но для примера)
    // const googleSignInBtnRegister = document.getElementById('google-signin-btn-register');
    // if (googleSignInBtnRegister) {
    //     googleSignInBtnRegister.addEventListener('click', handleGoogleSignIn);
    // }

    // Дополнительно: отслеживание состояния аутентификации (можно добавить, если нужно обновлять UI при загрузке страницы)
    // firebase.auth().onAuthStateChanged((user) => {
    //   if (user) {
    //     // Пользователь вошел в систему.
    //     console.log("Состояние аутентификации изменилось: пользователь вошел", user);
    //     // Здесь можно обновить интерфейс
    //   } else {
    //     // Пользователь вышел из системы или не вошел.
    //     console.log("Состояние аутентификации изменилось: пользователь вышел");
    //     // Здесь можно обновить интерфейс
    //   }
    // });
});