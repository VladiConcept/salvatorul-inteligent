const installBtn = document.getElementById('installBtn');

let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;

  installBtn.style.display = 'block';

  installBtn.addEventListener('click', () => {
    deferredPrompt.prompt();

    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User wants to install the PWA.');
      } else {
        console.log('User does not want to install the PWA');
      }
      deferredPrompt = null;
    });
  });
});
