let seconds = 0;
let pauses = 0;
let timer;
let running = false;

const timerEl = document.getElementById("timer");
const statsEl = document.getElementById("stats");
const liveTimeEl = document.getElementById("liveTime");
const livePausesEl = document.getElementById("livePauses");
const liveScoreEl = document.getElementById("liveScore");
const progressFill = document.getElementById("progressFill");

fetch("/me")
.then(r => r.json())
.then(user => {

    if(!user.username) return;

    document.getElementById("topUsername").innerText =
        user.username;

    document.getElementById("streakBadge").innerText =
        `${user.streak} day streak`;

    if(user.avatar){
        document.getElementById("topAvatar").src =
            user.avatar;
    }

    if(user.accent){
        document.documentElement.style.setProperty(
            "--accent",
            user.accent
        );
    }

    const hour = new Date().getHours();

    let greet = "Good to see you";

    if(hour < 12) greet = "Good morning";
    else if(hour < 18) greet = "Good afternoon";
    else greet = "Good evening";

    document.getElementById("greeting").innerText =
        `${greet}, ${user.username}`;
});

fetch("/profile_data")
.then(r => r.json())
.then(data => {

    const timeline = document.getElementById("timeline");

    if(!data.sessions || !data.sessions.length){
        timeline.innerHTML =
            `<div class="status-box">No sessions yet.</div>`;
        return;
    }

    const html = data.sessions.map(s => {
        const h = Math.max(12, Math.min(70, s.minutes));
        return `<div class="timeline-bar" style="height:${h}px"></div>`;
    }).join("");

    timeline.innerHTML = html;
});

function startTimer(){
    if(!running){
        running = true;

        timer = setInterval(() => {
            seconds++;
            updateDisplay();
            updateStats();
        }, 1000);

        statsEl.innerText = "Session in progress...";
    }
}

function pauseTimer(){
    if(running){
        pauses++;
        running = false;
        clearInterval(timer);
        statsEl.innerText = "Paused";
    }

    updateStats();
}

function endSession(){
    clearInterval(timer);
    running = false;

    const minutes = Math.floor(seconds / 60);
    const score = (minutes * 2) + 10 - (pauses * 5);

    fetch("/save_session",{
        method:"POST",
        headers:{
            "Content-Type":"application/json"
        },
        body:JSON.stringify({
            minutes:minutes,
            pauses:pauses,
            score:score
        })
    })
    .then(() => {
        statsEl.innerText = "Nice session completed.";

        seconds = 0;
        pauses = 0;

        updateDisplay();
        updateStats();
    });
}

function updateDisplay(){
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;

    const next =
        (m < 10 ? "0" : "") + m + ":" +
        (s < 10 ? "0" : "") + s;

    if(timerEl.innerText !== next){
        timerEl.innerText = next;
    }
}

function updateStats(){
    const minutes = Math.floor(seconds / 60);
    const score = (minutes * 2) + 10 - (pauses * 5);

    liveTimeEl.innerText = `${minutes} min`;
    livePausesEl.innerText = pauses;
    liveScoreEl.innerText = score;

    const progress = Math.min(100, (minutes / 30) * 100);
    progressFill.style.width = `${progress}%`;
}