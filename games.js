let currentQuiz = null;
function startQuiz(questions, onFinish) {
  currentQuiz = { questions, index: 0, correct: 0, onFinish };
  renderQuizQuestion();
}
function renderQuizQuestion() {
  const container = document.getElementById('courseContent');
  const qData = currentQuiz.questions[currentQuiz.index];
  if (!qData) return endQuiz();
  container.innerHTML = '';
  const qEl = document.createElement('h4');
  qEl.textContent = `Q${currentQuiz.index + 1}. ${qData.q}`;
  container.appendChild(qEl);
  qData.options.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.textContent = opt;
    btn.className = 'quiz-option';
    btn.onclick = () => {
      if (i === qData.ans) {
        currentQuiz.correct++;
        playSound('assets/sounds/success.mp3');
      }
      currentQuiz.index++;
      renderQuizQuestion();
    };
    container.appendChild(btn);
  });
}
function endQuiz() {
  const total = currentQuiz.questions.length;
  const correct = currentQuiz.correct;
  const percent = Math.round((correct / total) * 100);
  const grade = percent >= 80 ? 'A' : percent >= 60 ? 'B' : 'C';
  const container = document.getElementById('courseContent');
  container.innerHTML = `<div class="scorecard"><h3>Scorecard</h3><p>Total: ${correct} / ${total}</p><p>Percentage: ${percent}%</p><p>Grade: ${grade}</p><button id="retryQuiz">Retry</button></div>`;
  document.getElementById('retryQuiz').onclick = () => {
    startQuiz(currentQuiz.questions, currentQuiz.onFinish);
  };
  if (currentQuiz.onFinish) currentQuiz.onFinish(percent);
  currentQuiz = null;
}
