const mainDiv = document.getElementById("mainDiv");
const videoButton = document.getElementById("videoBtn");
const startButton = document.getElementById("startBtn");
const manualButton = document.getElementById("manualBtn");
const quizButton = document.getElementById("quizBtn");
const infoButton = document.getElementById("infoBtn");
const addBtn = document.getElementById('add-to-home-screen');

let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    
    addBtn.style.display = 'block';

    addBtn.addEventListener('click', () => {
        deferredPrompt.prompt();
        
        deferredPrompt.userChoice.then((choiceResult) => {
            console.log(choiceResult.outcome);
            if (choiceResult.outcome === 'accepted') {
                console.log('User accepted the A2HS prompt');
            } else {
                console.log('User dismissed the A2HS prompt');
            }
            deferredPrompt = null;
        });
    });
});