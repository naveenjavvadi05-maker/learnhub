let db;
const DB_NAME = 'LearnHubDB';
const DB_VERSION = 1;

function initDB(onReady) {
  const request = indexedDB.open(DB_NAME, DB_VERSION);
  request.onerror = () => console.error('DB error');
  request.onsuccess = e => {
    db = e.target.result;
    if (onReady) onReady();
  };
  request.onupgradeneeded = e => {
    db = e.target.result;
    if (!db.objectStoreNames.contains('profiles')) {
      db.createObjectStore('profiles', { keyPath: 'id' });
    }
    if (!db.objectStoreNames.contains('scores')) {
      db.createObjectStore('scores', { keyPath: 'timestamp' });
    }
  };
}

function saveProfile(profile) {
  const tx = db.transaction(['profiles'], 'readwrite');
  tx.objectStore('profiles').put({ id: 'user1', ...profile });
}

function loadProfile(callback) {
  const tx = db.transaction(['profiles'], 'readonly');
  const req = tx.objectStore('profiles').get('user1');
  req.onsuccess = e => {
    callback(e.target.result || {});
  };
}

function saveScore(lessonId, score) {
  const tx = db.transaction(['scores'], 'readwrite');
  tx.objectStore('scores').add({
    lessonId,
    score,
    timestamp: Date.now()
  });
}

function getAllScores(callback) {
  const tx = db.transaction(['scores'], 'readonly');
  const store = tx.objectStore('scores');
  const req = store.getAll();
  req.onsuccess = e => callback(e.target.result || []);
}
