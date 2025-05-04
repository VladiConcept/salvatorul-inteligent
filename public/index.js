const mainDiv = document.getElementById("mainDiv");
const videoButton = document.getElementById("videoBtn");
const startButton = document.getElementById("startBtn");
const manualButton = document.getElementById("manualBtn");
const quizButton = document.getElementById("quizBtn");
const infoButton = document.getElementById("infoBtn");

if ('serviceWorker' in navigator) {
    
    navigator.serviceWorker.register("service-worker.js").then(registration => {
        console.log("SW registered!");
        console.log(registration);
    }).catch(error => {
        console.log("SW registration failed!");
        console.log(error);
    });
}