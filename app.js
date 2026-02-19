let appData = null;
let currentPath = { grade: null, subject: null, chapter: null };
function showSection(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
  document.getElementById(id).classList.remove('hidden');
  if (id === 'profile') loadProfile(renderProfile);
  if (id === 'dashboard') renderDashboard();
}
function loadData(callback) {
  if (appData) return callback(appData);
  fetch('data.json').then(r => r.json()).then(data => { appData = data; callback(appData); });
}
function renderGrades() {
  loadData(data => {
    const gradesEl = document.getElementById('grades');
    gradesEl.innerHTML = '';
    Object.keys(data.grades).forEach(g => {
      const btn = document.createElement('button');
      btn.textContent = `Grade ${g}`;
      btn.onclick = () => selectGrade(g);
      gradesEl.appendChild(btn);
    });
  });
}
function selectGrade(grade) {
  currentPath = { grade, subject: null, chapter: null };
  const gradeData = appData.grades[grade];
  const subjects = Object.keys(gradeData.subjects);
  showCourseSection(`Grade ${grade}`, container => {
    subjects.forEach(sub => {
      const btn = document.createElement('button');
      btn.textContent = sub;
      btn.onclick = () => selectSubject(sub);
      container.appendChild(btn);
    });
  });
}
function selectSubject(subject) {
  currentPath.subject = subject;
  const chapters = Object.keys(appData.grades[currentPath.grade].subjects[subject].chapters);
  showCourseSection(`${subject}`, container => {
    chapters.forEach(ch => {
      const btn = document.createElement('button');
      btn.textContent = ch;
      btn.onclick = () => selectChapter(ch);
      container.appendChild(btn);
    });
  });
}
function selectChapter(chapter) {
  currentPath.chapter = chapter;
  const chapterData = appData.grades[currentPath.grade].subjects[currentPath.subject].chapters[chapter];
  showCourseSection(`${chapter}`, container => {
    const video = document.createElement('video');
    video.src = chapterData.lesson;
    video.controls = true;
    video.style.width = '100%';
    video.style.maxHeight = '240px';
    container.appendChild(video);
    const quizBtn = document.createElement('button');
    quizBtn.textContent = 'Start Quiz';
    quizBtn.style.marginTop = '0.75rem';
    quizBtn.onclick = () => {
      startQuiz(chapterData.quiz, percent => {
        saveScore(chapter, percent);
        loadProfile(p => {
          const newPoints = (p.points || 0) + percent;
          const updated = updateStreakAndBadges({ ...p, points: newPoints });
          saveProfile(updated);
        });
        simpleConfetti();
      });
    };
    container.appendChild(quizBtn);
  });
}
function showCourseSection(title, builder) {
  document.getElementById('course').classList.remove('hidden');
  document.getElementById('courseTitle').textContent = title;
  const container = document.getElementById('courseContent');
  container.innerHTML = '';
  builder(container);
}
function goBack() {
  if (currentPath.chapter) {
    currentPath.chapter = null;
    selectSubject(currentPath.subject);
  } else if (currentPath.subject) {
    currentPath.subject = null;
    selectGrade(currentPath.grade);
  } else {
    document.getElementById('course').classList.add('hidden');
  }
}
function renderProfile(profile) {
  document.getElementById('studentName').value = profile.name || '';
  document.getElementById('studentGrade').value = profile.grade || '';
  document.getElementById('totalPoints').textContent = profile.points || 0;
  const updated = updateStreakAndBadges(profile);
  document.getElementById('streak').textContent = updated.streak || 0;
  renderBadges(updated.badges || []);
}
function handleSaveProfile() {
  loadProfile(prev => {
    const name = document.getElementById('studentName').value;
    const grade = document.getElementById('studentGrade').value;
    const now = Date.now();
    const merged = { ...prev, name, grade, points: prev.points || 0, lastLogin: now, streak: prev.streak || 0, badges: prev.badges || [] };
    const updated = updateStreakAndBadges(merged);
    saveProfile(updated);
    renderProfile(updated);
    alert('Profile saved');
  });
}
function updateStreakAndBadges(profile) {
  const now = Date.now();
  let streak = profile.streak || 0;
  if (!profile.lastLogin) {
    streak = 1;
  } else if (isNewDay(profile.lastLogin, now)) {
    if (isConsecutiveDay(profile.lastLogin, now)) streak += 1;
    else streak = 1;
  }
  profile.lastLogin = now;
  profile.streak = streak;
  const badges = new Set(profile.badges || []);
  if (streak >= 7) badges.add('7daywarrior');
  if ((profile.points || 0) >= 200) badges.add('quizmaster');
  profile.badges = Array.from(badges);
  return profile;
}
function renderBadges(badgeIds) {
  const container = document.getElementById('badges');
  container.innerHTML = '';
  badgeIds.forEach(id => {
    const span = document.createElement('span');
    span.className = 'badge';
    const desc = appData?.badges?.[id]?.desc || id;
    span.textContent = desc;
    container.appendChild(span);
  });
}
function renderDashboard() {
  getAllScores(scores => {
    const total = scores.reduce((sum, s) => sum + s.score, 0);
    document.getElementById('dashScore').textContent = total;
    document.getElementById('completed').textContent = scores.length;
    document.getElementById('pending').textContent = Math.max(0, 10 - scores.length);
    document.getElementById('rank').textContent = 1;
    const leaderboardEl = document.getElementById('leaderboard');
    leaderboardEl.innerHTML = `<li>You - ${total} pts</li>`;
    drawWeeklyGraph(scores);
  });
}
function drawWeeklyGraph(scores) {
  const ctx = document.getElementById('weeklyGraph').getContext('2d');
  ctx.clearRect(0, 0, 320, 160);
  ctx.fillStyle = '#e0e0e0';
  ctx.fillRect(0, 0, 320, 160);
  ctx.fillStyle = '#4CAF50';
  const barWidth = 30, gap = 10, maxHeight = 120, baseY = 150;
  const last7 = scores.slice(-7);
  last7.forEach((s, i) => {
    const h = Math.min(maxHeight, s.score);
    const x = 10 + i * (barWidth + gap);
    ctx.fillRect(x, baseY - h, barWidth, h);
  });
}
