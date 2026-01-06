document.addEventListener('DOMContentLoaded', () => {

  // ===== GET DOM ELEMENTS =====
  const lengthEl = document.getElementById("length");
  const upperEl = document.getElementById("uppercase");
  const lowerEl = document.getElementById("lowercase");
  const numberEl = document.getElementById("numbers");
  const symbolEl = document.getElementById("symbols");
  const passwordEl = document.getElementById("password");
  const generateBtn = document.getElementById("generate");
  const toggleBtn = document.getElementById("toggle");
  const copyBtn = document.getElementById("copy");
  const copiedMessage = document.getElementById("copiedMessage");
  const strengthBar = document.getElementById("strengthBar");
  const toggleModeBtn = document.getElementById("toggle-mode");
  const passwordList = document.getElementById("passwordList");
  const clearBtn = document.getElementById("clearSaved");
  const warningMessage = document.getElementById("warningMessage");
  const regenerateBtn = document.getElementById("regenerateBtn");

  // ===== CHARACTER SETS =====
  const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const LOWER = "abcdefghijklmnopqrstuvwxyz";
  const NUMBERS = "0123456789";
  const SYMBOLS = "!@#$%^&*()_+-=[]{}|;:,.<>/?";

  // Saved passwords array
  let savedPasswords = [];

  // Hide copied message initially
  copiedMessage.textContent = "";
  copiedMessage.style.opacity = '0';

  // ===== HELPER FUNCTION: Secure Random Index =====
  function secureRandomIndex(max) {
    if (window.crypto && window.crypto.getRandomValues) {
      const array = new Uint32Array(1);
      window.crypto.getRandomValues(array);
      return array[0] % max;
    } else return Math.floor(Math.random() * max);
  }

  // ===== PASSWORD GENERATION FUNCTION =====
  function generatePassword() {
    const length = parseInt(lengthEl.value, 10);
    if (isNaN(length) || length < 1) return;

    // Build character pool based on selected checkboxes
    let chars = "";
    if (upperEl.checked) chars += UPPER;
    if (lowerEl.checked) chars += LOWER;
    if (numberEl.checked) chars += NUMBERS;
    if (symbolEl.checked) chars += SYMBOLS;

    // If no checkbox selected, show warning
    if (!chars) {
      passwordEl.value = "";
      warningMessage.textContent = "⚠️ Select at least one option!";
      strengthBar.style.width = '0';
      return;
    } else warningMessage.textContent = "";

    // Ensure at least one char from each selected set
    const requiredChars = [];
    if (upperEl.checked) requiredChars.push(UPPER.charAt(secureRandomIndex(UPPER.length)));
    if (lowerEl.checked) requiredChars.push(LOWER.charAt(secureRandomIndex(LOWER.length)));
    if (numberEl.checked) requiredChars.push(NUMBERS.charAt(secureRandomIndex(NUMBERS.length)));
    if (symbolEl.checked) requiredChars.push(SYMBOLS.charAt(secureRandomIndex(SYMBOLS.length)));

    // Fill remaining length
    let passwordChars = requiredChars.slice();
    let remainingLength = length - requiredChars.length;
    for (let i = 0; i < remainingLength; i++) {
      passwordChars.push(chars.charAt(secureRandomIndex(chars.length)));
    }

    // Shuffle password
    for (let i = passwordChars.length - 1; i > 0; i--) {
      const j = secureRandomIndex(i + 1);
      [passwordChars[i], passwordChars[j]] = [passwordChars[j], passwordChars[i]];
    }

    const pwd = passwordChars.join('');
    passwordEl.value = pwd;

    updateStrength(pwd);
    savePassword(pwd);
  }

  // ===== PASSWORD STRENGTH FUNCTION =====
  function updateStrength(password) {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password) && /[!@#$%^&*()_+\-=[\]{}|;:,.<>/?]/.test(password)) strength++;

    switch(strength){
      case 0: strengthBar.style.width='0'; break;
      case 1: strengthBar.style.width='33%'; strengthBar.style.background='red'; break;
      case 2: strengthBar.style.width='66%'; strengthBar.style.background='orange'; break;
      case 3: strengthBar.style.width='100%'; strengthBar.style.background='green'; break;
    }
  }

  // ===== SHOW/HIDE PASSWORD =====
  toggleBtn.addEventListener('click', ()=>{
    if(passwordEl.type==='password'){
      passwordEl.type='text';
      toggleBtn.innerHTML = '<i class="fa-solid fa-eye-slash"></i>';
    } else {
      passwordEl.type='password';
      toggleBtn.innerHTML = '<i class="fa-solid fa-eye"></i>';
    }
  });

  // ===== COPY PASSWORD =====
  copyBtn.addEventListener('click', async () => {
    const pwd = passwordEl.value.trim();
    if (!pwd || pwd === "Select at least one option!") return;

    try {
      await navigator.clipboard.writeText(pwd);
      copiedMessage.textContent = "Copied!";
      copiedMessage.style.opacity = '1';
      setTimeout(() => { copiedMessage.style.opacity = '0'; }, 2000);
    } catch (err) {
      console.error("Failed to copy password:", err);
    }
  });

  // ===== CLEAR SAVED PASSWORDS =====
  clearBtn.addEventListener('click', () => {
    savedPasswords = [];
    localStorage.removeItem("savedPasswords");
    renderSavedPasswords();
  });

  // ===== REGENERATE PASSWORD BUTTON =====
  regenerateBtn.addEventListener('click', () => { generatePassword(); });

  // ===== DARK MODE TOGGLE =====
  toggleModeBtn.addEventListener('click', ()=>{
    document.body.classList.toggle('dark');
    document.body.classList.toggle('light');
  });

  // ===== SAVE PASSWORD (LIMIT 3) =====
  function savePassword(pwd){
    if(!savedPasswords.includes(pwd)){
      savedPasswords.unshift(pwd);
      if(savedPasswords.length > 3) savedPasswords.pop();
      localStorage.setItem("savedPasswords", JSON.stringify(savedPasswords));
      renderSavedPasswords();
    }
  }

  // ===== RENDER SAVED PASSWORDS =====
  function renderSavedPasswords(){
    passwordList.innerHTML = "";
    savedPasswords.forEach((pwd)=>{
      const li = document.createElement('li');
      li.textContent = pwd;
      const btn = document.createElement('button');
      btn.textContent='Copy';
      btn.addEventListener('click', ()=>{navigator.clipboard.writeText(pwd);});
      li.appendChild(btn);
      passwordList.appendChild(li);
    });
  }

  // ===== GENERATE BUTTON EVENT =====
  generateBtn.addEventListener('click', generatePassword);
});
