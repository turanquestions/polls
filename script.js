let currentQuestion = 1;
let score = 0;
const totalQuestions = 5;

function startPoll() {
    document.querySelector('.poll-list').style.display = 'none';
    document.querySelector('.poll-questions').style.display = 'block';
    showQuestion();
}

function showQuestion() {
    document.getElementById('question').textContent = `Вопрос ${currentQuestion}: Текст вопроса ${currentQuestion}`;
}

function nextQuestion() {
    score += Math.floor(Math.random() * 10);
    currentQuestion++;
    if (currentQuestion > totalQuestions) {
        showResult();
    } else {
        showQuestion();
    }
}

function showResult() {
    document.querySelector('.poll-questions').style.display = 'none';
    document.querySelector('.poll-result').style.display = 'block';
    document.getElementById('result').textContent = score;
}

function resetPoll() {
    document.querySelector('.poll-result').style.display = 'none';
    document.querySelector('.poll-list').style.display = 'block';
    currentQuestion = 1;
    score = 0;
}
