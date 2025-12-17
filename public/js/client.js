var socket = io();


var form = document.getElementById('form');
var input = document.getElementById('input');
var buzzer = document.getElementById('buzzer');
var mcquestion = document.getElementById('mc-question');
var openquestion = document.getElementById('open-question');
var openanswer = document.getElementById('open-question-answer');

var option1 = document.getElementById('option1');
var option2 = document.getElementById('option2');
var option3 = document.getElementById('option3');
var option4 = document.getElementById('option4');
var stealBuzzer = document.getElementById('steal');
var keepBuzzer = document.getElementById('keep');

let uuid = getCookie("uuid");
let myname = getCookie("name");

if (!uuid || uuid == "")
    uuid = crypto.randomUUID();

if (!myname || myname == "")
    myname = "";

console.log("uuid:", uuid);
console.log("name:", myname);


socket.on("connect", () => {
    console.log("connected");



    if (myname != "") {
        console.log("re-register");
        socket.emit('register', { uuid: uuid, name: myname });
        hide("register-panel");
        show("wait-panel", "flex");
    }

});

socket.on("disconnect", () => {
    console.log(socket.id, uuid); // undefined
    socket.emit('unregister', uuid);
});

function selected(elem) { elem.style.backgroundColor = "blue" }


function clearSelected() {
    option1.style.backgroundColor = "";
    option2.style.backgroundColor = "";
    option3.style.backgroundColor = "";
    option4.style.backgroundColor = "";
}

function sendChoice(elem) {
    socket.emit('mc-answer', { uuid: uuid, answer: elem.innerText });
    disable("option1");
    disable("option2");
    disable("option3");
    disable("option4");
    selected(elem)
}

function sendOpenQuestionAnswer() {
    socket.emit('open-answer', { uuid: uuid, answer: openanswer.value });
    disable("open-question-answer");
    disable("open-question-submit");
}

socket.on('reset buzzer', function () {
    show("wait-panel")
    hide("mc-question-panel");
    hide("open-question-panel");
    disable("option1");
    disable("option2");
    disable("option3");
    disable("option4");
    option1.innerHTML = "";
    option2.innerHTML = "";
    option3.innerHTML = "";
    option4.innerHTML = "";
    enable("buzzer");
    enable("steal");
    enable("keep");
});

socket.on('show wait', function () {
    disable("buzzer");
    disable("steal");
    disable("keep");
    hide("register-panel");
    hide("mc-question-panel");
    hide("open-question-panel");
    hide("buzzer-panel");
    hide("stealorkeep-panel");
    show("wait-panel");

});
socket.on('show mc-question', function (param) {
    console.log("show mc-question ", param)
    hide("wait-panel");
    hide("open-question-panel")
    show("mc-question-panel")
    clearSelected();

    disable("option1");
    disable("option2");
    disable("option3");
    disable("option4");
    option1.innerHTML = "";
    option2.innerHTML = "";
    option3.innerHTML = "";
    option4.innerHTML = "";
    mcquestion.innerHTML = param;
});

socket.on('show open-question', function (param) {
    console.log("show open-question ", param)
    enable("open-question-answer");
    enable("open-question-submit");
    hide("wait-panel");
    hide("mc-question-panel");
    show("open-question-panel")
    clearSelected();
    openquestion.innerHTML = param;
});

socket.on('show options', function (options) {
    console.log("show options ", options)
    clearSelected();
    enable("option1");
    enable("option2");
    enable("option3");
    enable("option4");
    option1.innerHTML = options[0];
    option2.innerHTML = options[1];
    option3.innerHTML = options[2];
    option4.innerHTML = options[3];
});

socket.on('lock buzzer', function () {
    disable("buzzer");
    disable("steal");
    disable("keep");
});



socket.on('reset', function () {
    disable("buzzer");
    disable("steal");
    disable("keep");
    input.value = "";
    name = "";
    mcquestion.innerHTML = "";
    option1.innerHTML = "";
    option2.innerHTML = "";
    option3.innerHTML = "";
    option4.innerHTML = "";
    openquestion.innerHTML = "";
    openanswer.innerHTML = "";

    show("register-panel");
    hide("wait-panel");
    hide("buzzer-panel");
    hide("mc-question-panel");
    hide("open-question-panel");
    hide("stealorkeep-panel");
});

socket.on('show stealorkeep', function () {
    disable("buzzer");
    enable("steal");
    enable("keep");
    stealBuzzer.classList.remove("disabled");
    keepBuzzer.classList.remove("disabled");
    hide("register-panel");
    hide("wait-panel");
    hide("mc-question-panel");
    hide("open-question-panel");
    hide("buzzer-panel");
    show("stealorkeep-panel");
});

socket.on('show buzzer', function () {
    disable("buzzer");
    disable("steal");
    disable("keep");
    hide("register-panel");
    hide("mc-question-panel");
    hide("open-question-panel");
    show("buzzer-panel");
    hide("stealorkeep-panel");
});


buzzer.addEventListener('click', function (e) {
    e.preventDefault();
    socket.emit('buzz', uuid);
    disable("buzzer");
});

option1.addEventListener('click', function (e) {
    console.log("option1 clicked")
    e.preventDefault();
    sendChoice(this);
});
option2.addEventListener('click', function (e) {
    console.log("option2 clicked")
    e.preventDefault();
    sendChoice(this);
});
option3.addEventListener('click', function (e) {
    console.log("option3 clicked")
    e.preventDefault();
    sendChoice(this);
});
option4.addEventListener('click', function (e) {
    console.log("option4 clicked")
    e.preventDefault();
    sendChoice(this);
});

keepBuzzer.addEventListener('click', function (e) {
    e.preventDefault();
    socket.emit('buzz keep', uuid);
    stealBuzzer.classList.add("disabled");
    disable("keep");
    disable("steal");

});

stealBuzzer.addEventListener('click', function (e) {
    e.preventDefault();
    socket.emit('buzz steal', uuid);
    keepBuzzer.classList.add("disabled");
    disable("keep");
    disable("steal");
});

form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (input.value) {
        myname = input.value;
        document.getElementById("name").innerHTML = myname;
        socket.emit('register', { uuid: uuid, name: myname });
        setCookie("uuid", uuid, 1);
        setCookie("name", myname, 1);
        hide("register-panel");
        show("wait-panel", "flex");
    }
});
