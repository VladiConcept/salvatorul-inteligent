const mainDiv = document.getElementById("mainDiv");
const videoButton = document.getElementById("videoBtn");
const startButton = document.getElementById("startBtn");
const manualButton = document.getElementById("manualBtn");
const quizButton = document.getElementById("quizBtn");
const infoButton = document.getElementById("infoBtn");

let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  
  const installBtn = document.getElementById('install-btn');
  installBtn.style.display = 'block';

  installBtn.addEventListener('click', () => {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User installed the app');
      } else {
        console.log('User dismissed the install prompt');
      }
      deferredPrompt = null;
    });
  });
});


if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register("service-worker.js").then(registration => {
        console.log("SW registered!");
        console.log(registration);
    }).catch(error => {
        console.log("SW registration failed!");
        console.log(error);
    });
}