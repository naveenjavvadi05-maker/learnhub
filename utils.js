function isNewDay(last, now) {
  const oneDay = 24 * 60 * 60 * 1000;
  return now - last >= oneDay;
}

function isConsecutiveDay(last, now) {
  const oneDay = 24 * 60 * 60 * 1000;
  const diffDays = Math.round((now - last) / oneDay);
  return diffDays === 1;
}

function playSound(src) {
  const audio = new Audio(src);
  audio.play().catch(() => {});
}

function simpleConfetti() {
  alert('🎉 Congratulations!');
}
