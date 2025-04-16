const chatBox = document.getElementById('chat-box');
const chatForm = document.getElementById('chat-form');
const userInput = document.getElementById('user-input');
const sendSound = new Audio('/static/send.mp3');
const receiveSound = new Audio('/static/receive.mp3');

let historico = [];

function addMessage(sender, message) {
  const messageElement = document.createElement('div');
  messageElement.classList.add('message');
  messageElement.classList.add(sender === 'Você' ? 'user-message' : 'bot-message');
  messageElement.innerHTML = `<strong>${sender}:</strong> ${message}`;
  chatBox.appendChild(messageElement);
  scrollIfAtBottom();

  historico.push({ sender, message });
  salvarNoLocalStorage();
}

function salvarNoLocalStorage() {
  localStorage.setItem('chatHistorico', JSON.stringify(historico));
}

function carregarHistorico() {
  const salvo = localStorage.getItem('chatHistorico');
  if (salvo) {
    historico = JSON.parse(salvo);
    historico.forEach(msg => {
      const messageElement = document.createElement('div');
      messageElement.classList.add('message');
      messageElement.classList.add(msg.sender === 'Você' ? 'user-message' : 'bot-message');
      messageElement.innerHTML = `<strong>${msg.sender}:</strong> ${msg.message}`;
      chatBox.appendChild(messageElement);
    });
    chatBox.scrollTop = chatBox.scrollHeight;
  }
}

function limparHistorico() {
  localStorage.removeItem('chatHistorico');
  chatBox.innerHTML = '';
  historico = [];
}

function scrollIfAtBottom() {
  const nearBottom = chatBox.scrollHeight - chatBox.scrollTop <= chatBox.clientHeight + 50;
  if (nearBottom) chatBox.scrollTop = chatBox.scrollHeight;
}

chatForm.addEventListener('submit', function (e) {
  e.preventDefault();
  const message = userInput.value.trim();
  if (message === '') return;

  addMessage('Você', message);
  sendSound.play();
  userInput.value = '';

  const typingElement = document.createElement('div');
  typingElement.classList.add('bot-message', 'digitando');
  typingElement.innerText = 'Bot está digitando...';
  chatBox.appendChild(typingElement);
  scrollIfAtBottom();

  fetch('/ask', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: message })
  })
    .then(response => response.json())
    .then(data => {
      chatBox.removeChild(typingElement);
      addMessage('Bot', data.resposta);
      receiveSound.play();
    })
    .catch(error => {
      console.error('Erro ao obter resposta:', error);
      chatBox.removeChild(typingElement);
      addMessage('Bot', '❌ Ocorreu um erro. Tente novamente.');
    });
});

// Entrada por voz
const recognition = new webkitSpeechRecognition();
recognition.lang = 'pt-BR';
function ouvirMensagem() {
  recognition.start();
}
recognition.onresult = function (event) {
  userInput.value = event.results[0][0].transcript;
};

// Alternar modo claro/escuro
function alternarModo() {
  document.body.classList.toggle('light-mode');
}

// Estrelas animadas
const canvas = document.getElementById('stars');
const ctx = canvas.getContext('2d');
let width, height, stars = [];

function resizeCanvas() {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
}

function createStars(count) {
  stars = [];
  for (let i = 0; i < count; i++) {
    stars.push({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.5,
      speed: Math.random() * 0.5 + 0.1
    });
  }
}

function animateStars() {
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = 'white';
  stars.forEach(star => {
    star.y += star.speed;
    if (star.y > height) {
      star.y = 0;
      star.x = Math.random() * width;
    }
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
    ctx.fill();
  });
  requestAnimationFrame(animateStars);
}

window.addEventListener('resize', () => {
  resizeCanvas();
  createStars(150);
});

window.onload = () => {
  resizeCanvas();
  createStars(150);
  animateStars();
  carregarHistorico();
};
