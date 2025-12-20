let currentUser = null;
let html5Qr;

function show(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
  document.getElementById(id).classList.remove('hidden');
}

function acceptPermissions() {
  show('loginScreen');
}

function login() {
  const email = document.getElementById('email').value;
  if (!email) return alert("Enter email");
  currentUser = email;
  show('homeScreen');
}

function logout() {
  currentUser = null;
  show('loginScreen');
}

function goHome() {
  if (html5Qr) html5Qr.stop();
  show('homeScreen');
}

function openScanner() {
  show('scannerScreen');
  html5Qr = new Html5Qrcode("reader");
  html5Qr.start(
    { facingMode: "environment" },
    { fps: 10, qrbox: 250 },
    qrText => {
      saveScan(qrText);
      alert("Scanned: " + qrText);
      goHome();
    }
  );
}

function openGenerator() {
  show('generatorScreen');
}

function generateQR() {
  const text = document.getElementById('qrText').value;
  document.getElementById('qrResult').innerHTML =
    `<img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(text)}">`;
}

function saveScan(data) {
  let saved = JSON.parse(localStorage.getItem('scans') || '[]');
  saved.push({ data, time: new Date().toLocaleString() });
  localStorage.setItem('scans', JSON.stringify(saved));
}

function openSaved() {
  show('savedScreen');
  const list = document.getElementById('savedList');
  list.innerHTML = "";
  let saved = JSON.parse(localStorage.getItem('scans') || '[]');
  saved.forEach(s => {
    let li = document.createElement('li');
    li.textContent = `${s.data} (${s.time})`;
    list.appendChild(li);
  });
}

function clearSaved() {
  localStorage.removeItem('scans');
  openSaved();
}

function openSettings() {
  show('settingsScreen');
}

function setTheme(theme) {
  document.body.className = theme;
}
