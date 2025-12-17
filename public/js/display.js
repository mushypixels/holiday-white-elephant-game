var socket = io();

const uuid = crypto.randomUUID();
        console.log(uuid);      
        

var registered = document.getElementById("registered");
var mcquestion = document.getElementById("mc-question");
var openquestion = document.getElementById("open-question");
var choices = document.getElementById("choices");
var openanswer = document.getElementById("open-answer");
var playerList = document.getElementById("player-list");
var spinPlayerList = document.getElementById("spin-player-list");

var stealOrKeep = document.getElementById("stealorkeep-results");
var correctAnsIdx = -1;
var audioIntro = document.getElementById("audio-intro");
var audioRound2 = document.getElementById("audio-round2");
var winnerAnswer = document.getElementById("winner-answer");

var players = [];
var spinPlayers = [];
var spinPlayerIdx = 0;

function show(id, type = "block") { document.getElementById(id).style.display = type; }
function hide(id) { document.getElementById(id).style.display = "none"; }
function hideAll() {
    hide("intro-panel");
    hide("logo");
    hide("r1-panel");
    hide("r2-panel");
    hide("r3-panel");
    hide("mc-question-panel");
    hide("open-question-panel");
    hide("category-panel");
    hide("spin-panel");
    hide("stealorkeep-panel");
    hide("player-list");
    hide("spin-player-list");
}
function decodeHtml(html) {
    var txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
}
function resetQuestion() {
    hide("open-answer");
    hide("choices");
    correctAnsIdx = -1;
    mcquestion.innerText = "";
    openquestion.innerText = "";
    openanswer.innerText = "";
    choices.innerHTML = "";
}

function updatePlayerList() {
    let html = "<ul>"
    for (i = 0; i < players.length; i++) {
        var css = "";
        switch (players[i].state) {
            case "buzzed": css = " class='buzzed-player'"; break;
            case "answered": css = " class='answered-player'"; break;
            case "winner": css = " class='winner-player'"; break;
            case "correct": css = " class='correct-player'"; break;
            case "incorrect": css = " class='incorrect-player'"; break;
            default: css = ""; break;
        }
        html += "<li" + css + ">"+players[i].name;

        if (players[i].answer!="") {
            html += " [" + players[i].answer + "]";
        }
        
        html += "</li>";
    }   
    html += "</ul>";
    playerList.innerHTML = html;
    console.log("updated player list",players);
}

function resetSpinPlayerList() {
    spinPlayerIdx=0;
    for (i = 0; i < spinPlayers.length; i++) {
        spinPlayers[i].state = "";
        spinPlayers[i].answer = "";
    }
}

function updateSpinPlayerList() {
    if (spinPlayers.length==0)
        spinPlayers = players;

    let html = "<ul>"
    for (i = 0; i < spinPlayers.length; i++) {
        var css = "";
        switch (spinPlayers[i].state) {
            case "out": css = " class='outofgame-spin-player'"; break;
            default: css = ""; break;
        }
        if (i == spinPlayerIdx)
            css = " class='current-spin-player'";

            html += "<li" + css + ">"+spinPlayers[i].name;

        if (spinPlayers[i].answer!="") {
            html += " [" + spinPlayers[i].answer + "]";
        }
        
        html += "</li>";
    }   
    html += "</ul>";
    spinPlayerList.innerHTML = html;
    console.log("updated spin player list",spinPlayers);
}

// socket.on('display show registered', function(p) {
//     console.log("show registed", p)
//     var html = "";
//     for(i=0; i<p.registered.length; i++) {
//         html += p.registered[i] + "<br/>";
//     }                        
//     registered.innerHTML = html;
// });


socket.on("display show registered", function (p) {
    console.log("show registed", p);
    players = p;
    updatePlayerList()
});


socket.on('display r1 intro', function () {
    console.log("r1 intro")
    hideAll();
    show("player-list");
    show("logo");
    show("game-panel")
    show("r1-panel");
});

socket.on('display r2 intro', function () {
    console.log("r2 intro")
    hideAll();
    show("player-list");
    show("logo");
    show("game-panel")
    show("r2-panel");
    playRound2();
});

socket.on('display r3 intro', function () {
    console.log("r3 intro")
    hideAll();
    show("player-list");
    show("logo");
    show("game-panel")
    show("r3-panel");
    playRound2();
});



socket.on('display show mc-question', function (q) {
    console.log("show mc-question: ", JSON.stringify(q))
    resetQuestion();
    mcquestion.innerHTML = /*"Q" + (q.question_num + 1) + ": " +*/ decodeHtml(q.question.question.en) + "<br/>" + decodeHtml(q.question.question.zh);
    hideAll();
    show("player-list");
    show("logo");
    show("game-panel");
    show("mc-question-panel", "flex");
    show("mc-question");
});


socket.on('display show choices', function (config) {
    console.log("show choices", config)
    let html = "<ul>"
    for (i = 0; i < config.choices.length; i++) {
        var correctTag = "";
        if (config.choices[i].en == config.answer.en) {
            correctAnsIdx = i;
            html += "<li id='answer-" + i + "' class='correct-answer' onclick='showCorrect(this)'>" + config.choices[i].en + "&nbsp;/&nbsp;" + config.choices[i].zh + "</li>";
        } else {
            html += "<li id='answer-" + i + "' onclick='showIncorrect(this)'>" + config.choices[i].en + "&nbsp;/&nbsp;" + config.choices[i].zh + "</li>";
        }

    }
    html += "</ul>";

    choices.innerHTML = html;
    show("choices", "flex");
});

socket.on('display show open-question', function (q) {
    console.log("show open-question: ", JSON.stringify(q))
    resetQuestion();
    openquestion.innerHTML = /*"Q" + (q.question_num + 1) + ": " +*/ decodeHtml(q.question.question.en) + "<br/>" + decodeHtml(q.question.question.zh);
    hideAll();
    show("logo");
    show("player-list");
    show("game-panel");
    show("open-question-panel", "flex");
    show("open-question");
    show('open-player-list');
});

socket.on('display show r1 correct answer', function (params) {
    console.log("show correct answer")
    document.getElementById("answer-" + correctAnsIdx).style.backgroundColor = "#00ff00";
    playCorrect();
    players = params.players;
    updatePlayerList();
});

socket.on('display show r2 correct answer', function (params) {
    console.log("show correct answer")
    playCorrect();
    players = params.players;
    spinPlayers = params.players;
    spinPlayers.reverse(); 

    updatePlayerList();
    openanswer.innerText = params.answer;
    show("open-answer", "flex");
});

socket.on('display show answer', function (ans) {
    console.log("show answer", ans)
    document.getElementById("answer-" + ans).click();
});

socket.on('display show spin', function (ans) {
    console.log("show spin")
    hideAll();
    hide("player-list");
    show("spin-player-list");
    resetSpinPlayerList();
    updateSpinPlayerList();

    show("logo");
    show("game-panel");
    show("spin-panel");
});

socket.on('display show categories', function () {
    console.log("show categories")
    hideAll();
    show("player-list");
    show("logo");
    show("game-panel");
    show("category-panel");
});

socket.on('reset', function () {
    console.log("reset")
    hideAll();
    show("intro-panel");
    show("player-list");
    registered.innerHTML = "";
    playIntro();
});


socket.on('display spin wheel', function (ans) {
    console.log("spin wheel")
    setupAudio();
    updateSpinPlayerList();
    trigger.click();
   
});

socket.on('display stealorkeep results', function (results) {
    console.log("stealorkeep results");
    hideAll();
    show("logo");
    show("player-list");
    show("game-panel");
    show("stealorkeep-panel");
    let html = ""
    for (i = 0; i < results.keep.length; i++) {
        html += "<div class='keep'>SPLIT<br/>" + results.keep[i].name + "</div>";
    }
    for (i = 0; i < results.steal.length; i++) {
        html += "<div class='steal'>STEAL<br/>" + results.steal[i].name + "</div>";
    }
    html += "";

    stealOrKeep.innerHTML = html;
});


socket.on('reset buzzer', function () {
    playerList.innerHTML = "";
});

function play() {
    var audio = document.getElementById("audio");
    audio.play();
}


function playCorrect() {
    var audio = document.getElementById("audio-correct");
    audio.play();
}

function playIncorrect() {
    var audio = document.getElementById("audio-incorrect");
    audio.play();
}

function stopAll() {
    audioIntro.pause();
    audioRound2.pause();
}
function playIntro() {
    stopAll();
    audioIntro.play();
}

function playRound2() {
    stopAll();
    audioRound2.play();
}

function showIncorrect(el) {
    el.style.backgroundColor = "rgb(87,0,0)";
    playIncorrect();
}

function showCorrect(el) {
    el.style.backgroundColor = "#00ff00";
    playCorrect();
}

// actions
function startR1() {
    socket.emit('admin start r1');
}

function startR2() {
    socket.emit('admin start r2');
}

function showQuestion() {
    socket.emit('admin show question');
}

function showChoices() {
    socket.emit('admin show choices');
}
function showSpinWheel() {
    setupAudio();
    socket.emit('admin show spin');
}
// spinning wheel
/**
* Prize data will space out evenly on the deal wheel based on the amount of items available.
* @param text [string] name of the prize
* @param color [string] background color of the prize
* @param reaction ['resting' | 'dancing' | 'laughing' | 'shocked'] Sets the reaper's animated reaction
*/
const prizes = [
    {
        text: "Everyone swap gifts with the person immediately right/older than you!",
        color: "red",
        reaction: "dancing",
    },
    {
        text: "Unwrap your gift! If already unwrapped, you may swap for another unwrapped gift!",
        color: "darkgreen",
        reaction: "dancing",
    },
    {
        text: "Swap your gift with any boy!",
        color: "orange",
        reaction: "shocked",
    },
    {
        text: "You may swap your gift for any other gift or keep it",
        color: "darkgreen",
        reaction: "dancing"
    },
    {
        text: "Everyone swap gifts with the person immediately left/younger than you!",
        color: "red",
        reaction: "dancing"
    },
    {
        text: "Unwrap your gift. If already unwrapped choose someone else to unwrap their gift",
        color: "darkgreen",
        reaction: "laughing"
    },
    {
        text: "Swap your gift with any girl!",
        color: "orange",
        reaction: "shocked"
    },
    // {
    //     text: "You have been nice! You can take the Mystery Gift!",
    //     color: "rgb(204, 204, 0)",
    //     reaction: "laughing"
    // },
    {
        text: "Unwrap your gift! If already unwrapped, you may swap for another unwrapped gift!",
        color: "darkgreen",
        reaction: "dancing",
    },
];
var audio = null;
const wheel = document.querySelector(".deal-wheel");
const spinner = wheel.querySelector(".spinner");
const trigger = wheel.querySelector(".btn-spin");
const ticker = wheel.querySelector(".ticker");
const reaper = wheel.querySelector(".grim-reaper");
const prizeSlice = 360 / prizes.length;
const prizeOffset = Math.floor(180 / prizes.length);
const spinClass = "is-spinning";
const selectedClass = "selected";
const spinnerStyles = window.getComputedStyle(spinner);
let tickerAnim;
let rotation = 0;
let currentSlice = 0;
let prizeNodes;

const createPrizeNodes = () => {
    prizes.forEach(({ text, color, reaction }, i) => {
        const rotation = ((prizeSlice * i) * -1) - prizeOffset;

        spinner.insertAdjacentHTML(
            "beforeend",
            `<li class="prize" data-reaction=${reaction} style="--rotate: ${rotation}deg">
        <span class="text">${text}</span>
      </li>`
        );
    });
};

const createConicGradient = () => {
    spinner.setAttribute(
        "style",
        `background: conic-gradient(
      from -90deg,
      ${prizes
            .map(({ color }, i) => `${color} 0 ${(100 / prizes.length) * (prizes.length - i)}%`)
            .reverse()
        }
    );`
    );
};


const setupWheel = () => {
    createConicGradient();
    createPrizeNodes();
    prizeNodes = wheel.querySelectorAll(".prize");
};

const spinertia = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

const runTickerAnimation = () => {
    // https://css-tricks.com/get-value-of-css-rotation-through-javascript/
    const values = spinnerStyles.transform.split("(")[1].split(")")[0].split(",");
    const a = values[0];
    const b = values[1];
    let rad = Math.atan2(b, a);

    if (rad < 0) rad += (2 * Math.PI);
    const angle = Math.round(rad * (180 / Math.PI));
    const slice = Math.floor(angle / prizeSlice);

    if (currentSlice !== slice) {
        ticker.style.animation = "none";
        setTimeout(() => ticker.style.animation = null, 10);
        currentSlice = slice;
        if (audio != null)
            audio.trigger();
    }

    tickerAnim = requestAnimationFrame(runTickerAnimation);
};

const selectPrize = () => {
    const selected = Math.floor(rotation / prizeSlice);
    console.log("SELECTED", selected);
    prizeNodes[selected].classList.add(selectedClass);
    //  reaper.dataset.reaction = prizeNodes[selected].dataset.reaction;
};



trigger.addEventListener("click", () => {
    //if (reaper.dataset.reaction !== "resting") {
    // reaper.dataset.reaction = "resting";
    // }
    setupAudio();
    trigger.disabled = true;
    rotation = Math.floor(Math.random() * 360 + spinertia(2000, 10000));
    prizeNodes.forEach((prize) => prize.classList.remove(selectedClass));
    wheel.classList.add(spinClass);
    spinner.style.setProperty("--rotate", rotation);
    ticker.style.animation = "none";
    runTickerAnimation();
});

spinner.addEventListener("transitionend", () => {
    cancelAnimationFrame(tickerAnim);
    trigger.disabled = false;
    trigger.focus();
    rotation %= 360;
    selectPrize();
    wheel.classList.remove(spinClass);
    spinner.style.setProperty("--rotate", rotation);
    spinPlayerIdx++;
    //todo: check if next player is out or not
});

setupWheel();

function setupAudio() {

    if (audio == null) {
        // SPINNER AUDIO
        const w = new (window.AudioContext || window.webkitAudioContext);

        function k(t) {
            this.audioContext = t
        }
        k.prototype.setup = function () {
            this.gain = this.audioContext.createGain();
            this.bandpass = this.audioContext.createBiquadFilter(),
                this.bandpass.type = "bandpass",
                this.bandpass.frequency.value = 9e3,
                this.highpass = this.audioContext.createBiquadFilter(),
                this.highpass.type = "highpass",
                this.highpass.frequency.value = 4500,
                this.lowpass = this.audioContext.createBiquadFilter(),
                this.lowpass.type = "lowpass",
                this.lowpass.frequency.value = 2500,
                this.oscillators = [], [2, 3, 4.16, 5.43, 6.79, 8.21].forEach((t => {
                    const e = this.audioContext.createOscillator();
                    e.type = "square",
                        e.frequency.value = 40 * t,
                        e.frequency.exponentialRampToValueAtTime(.001, this.audioContext.currentTime + 1),
                        this.oscillators.push(e)
                })),
                this.oscillators.forEach((t => t.connect(this.bandpass))),
                this.bandpass.connect(this.highpass).connect(this.lowpass).connect(this.gain).connect(this.audioContext.destination)
        },
            k.prototype.trigger = function () {
                this.setup(),
                    this.gain.gain.setValueAtTime(1, this.audioContext.currentTime),
                    this.gain.gain.exponentialRampToValueAtTime(.01, this.audioContext.currentTime + .06),
                    this.oscillators.forEach((t => {
                        t.start(this.audioContext.currentTime + .01),
                            t.stop(this.audioContext.currentTime + .07)
                    }))
            };
        audio = new k(w);
    }
}