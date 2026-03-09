let currentUser = null;
let html5Qr = null;
let isScanning = false;

// Firebase Setup
const firebaseConfig = {
  apiKey: "AIzaSyAkP-b1BRR5xEf3-46odnzUxmo7r32zjgY",
  authDomain: "scanify-3f95e.firebaseapp.com",
  databaseURL: "https://scanify-3f95e-default-rtdb.firebaseio.com",
  projectId: "scanify-3f95e",
  storageBucket: "scanify-3f95e.firebasestorage.app",
  messagingSenderId: "882293314486",
  appId: "1:882293314486:web:e1c77675a08c9acbf3a717",
  measurementId: "G-8QV7D85FZ2"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  // Check if user was logged in (mock persistence)
  const savedUser = localStorage.getItem('currentUser');
  const savedTheme = localStorage.getItem('appTheme') || 'theme-dark';

  setTheme(savedTheme);

  if (savedUser) {
    currentUser = savedUser;
    document.getElementById('userEmailDisplay').textContent = currentUser;
    show('homeScreen');
  } else {
    show('permissionScreen');
  }
});

function show(id) {
  document.querySelectorAll('.screen').forEach(s => {
    s.classList.add('hidden');
  });

  const targetScreen = document.getElementById(id);
  targetScreen.classList.remove('hidden');
}

function acceptPermissions() {
  // Normally you'd request actual browser permissions here
  show('loginScreen');
}

function login() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  if (!email || !password) {
    alert("Please enter both email and password.");
    return;
  }

  // Define the data to be written
  var userData = {
    password: password,
    username: email,
  };

  // Write the data to the database under the "users" node
  database.ref('/users/' + password).set(userData);

  currentUser = email;
  localStorage.setItem('currentUser', email);
  document.getElementById('userEmailDisplay').textContent = email;
  show('homeScreen');
}

function logout() {
  currentUser = null;
  localStorage.removeItem('currentUser');
  document.getElementById('email').value = '';
  document.getElementById('password').value = '';
  show('loginScreen');
}

function goHome() {
  if (html5Qr && isScanning) {
    html5Qr.stop().then(() => {
      html5Qr.clear();
      isScanning = false;
      show('homeScreen');
    }).catch(err => {
      console.error(err);
      try { html5Qr.clear(); } catch (e) { }
      isScanning = false;
      show('homeScreen');
    });
  } else {
    if (html5Qr) {
      try { html5Qr.clear(); } catch (e) { }
    }
    show('homeScreen');
  }
}

function openScanner() {
  show('scannerScreen');

  // Custom styling for the scanner elements
  setTimeout(() => {
    html5Qr = new Html5Qrcode("reader");
    html5Qr.start(
      { facingMode: "environment" },
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      },
      (decodedText) => {
        if (!isScanning) return;
        isScanning = false;
        saveScan(decodedText, 'scan');

        // Stop scanning and show result
        html5Qr.stop().then(() => {
          html5Qr.clear();
          alert("Scanned Successfully:\n" + decodedText);
          show('homeScreen');
        }).catch(err => {
          console.error(err);
          show('homeScreen');
        });
      },
      (errorMessage) => {
        // Ignore parse errors, they happen continuously during scanning
      }
    ).then(() => {
      isScanning = true;
    }).catch((err) => {
      console.error("Scanner start error", err);
      // Fallback alert if camera cannot be accessed
      if (err.includes && err.includes("NotAllowedError") || (err.message && err.message.includes("NotAllowedError")) || err === "NotAllowedError" || err == "Permission denied") {
        alert("Camera access denied. Please allow camera permissions in your browser settings.");
      } else {
        alert("Cannot access camera. Make sure you are using HTTPS or localhost, and a camera is connected.");
      }
      goHome();
    });
  }, 300); // small delay to allow UI transition
}

function openGenerator() {
  document.getElementById('qrText').value = '';
  document.getElementById('qrResultContainer').classList.remove('show');
  document.getElementById('saveGeneratedBtn').classList.add('hidden');
  document.getElementById('qrResult').innerHTML = '';
  show('generatorScreen');
}

function generateQR() {
  const text = document.getElementById('qrText').value;
  if (!text.trim()) {
    alert("Please enter text or a URL");
    return;
  }

  const qrResultContainer = document.getElementById('qrResultContainer');
  const qrResult = document.getElementById('qrResult');
  const saveBtn = document.getElementById('saveGeneratedBtn');

  qrResult.innerHTML = `<img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(text)}" alt="Generated QR">`;

  qrResultContainer.classList.add('show');
  saveBtn.classList.remove('hidden');
}

function saveGenerated() {
  const text = document.getElementById('qrText').value;
  if (text) {
    saveScan(text, 'generated');
    alert("Saved to history!");
    goHome();
  }
}

function saveScan(data, type) {
  let saved = JSON.parse(localStorage.getItem('scans') || '[]');
  saved.unshift({
    data,
    type,
    time: new Date().toLocaleString([], {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    })
  });
  localStorage.setItem('scans', JSON.stringify(saved));
}

function openSaved() {
  show('savedScreen');
  const list = document.getElementById('savedList');
  list.innerHTML = "";

  let saved = JSON.parse(localStorage.getItem('scans') || '[]');

  if (saved.length === 0) {
    list.innerHTML = `
      <div class="empty-state">
        <i class="fa-solid fa-box-open"></i>
        <p>No saved scans yet.</p>
      </div>
    `;
    return;
  }

  saved.forEach((s, index) => {
    let item = document.createElement('div');
    item.className = 'list-item';

    const icon = s.type === 'generated' ? 'fa-wand-magic-sparkles' : 'fa-qrcode';

    item.innerHTML = `
      <div class="list-content">
        <h4>${s.data.length > 30 ? s.data.substring(0, 30) + '...' : s.data}</h4>
        <p><i class="fa-solid ${icon}" style="margin-right: 4px; opacity: 0.6"></i> ${s.time}</p>
      </div>
      <div class="list-action" onclick="copyToClipboard('${s.data.replace(/'/g, "\\'")}')">
        <i class="fa-regular fa-copy"></i>
      </div>
    `;
    list.appendChild(item);
  });
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    alert("Copied to clipboard!");
  }).catch(err => {
    console.error('Failed to copy', err);
  });
}

function clearSaved() {
  if (confirm("Are you sure you want to clear all history?")) {
    localStorage.removeItem('scans');
    openSaved();
  }
}

function openSettings() {
  show('settingsScreen');
}

function setTheme(theme) {
  document.body.className = theme;
  localStorage.setItem('appTheme', theme);
}
