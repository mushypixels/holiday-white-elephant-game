/*
ROUND 1 - Pick A Prize
ROUND 2 - Spin The Wheel
*/

const express = require('express');
const app = express();
const http = require('http');
var fs = require('fs');
const server = http.createServer(app);
const { Server } = require("socket.io");
const { ok } = require('assert');
const io = new Server(server);

let question_difficuly = "easy";


const DEFAULT_QUESTIONS_URL = 'https://opentdb.com/api.php?amount=50&category=9&difficulty=' + question_difficuly + '&type=multiple';

var openquestions = JSON.parse(fs.readFileSync('public/data/open-questions.json', 'utf8'));

let questions_url = DEFAULT_QUESTIONS_URL;

function shuffle(array) {
  let currentIndex = array.length, randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex > 0) {

    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}

function resetPlayersState(players) {
  for (let i = 0; i < players.length; i++) {
    players[i].state = "";
    players[i].answer = "";
  }
  io.emit("admin players", players);
  io.emit("display show registered", players);
}

function fetchQuestions() {
  fetch(questions_url)
    .then(response => response.json())
    .then(json => {
      qinfo.qid = -1;
      qinfo.buzzed = [];
      questions = json;
      console.log("questions fetched:", questions);
    })
    .catch(err => console.error(err));
}
var apicats = {
  categories: [
    { id: "any", title: "Any Category" },
    { id: "9", title: "General Knowledge" },
    { id: "10", title: "Entertainment: Books" },
    { id: "11", title: "Entertainment: Film" },
    { id: "12", title: "Entertainment: Music" },
    { id: "13", title: "Entertainment: Musicals &amp; Theatres" },
    { id: "14", title: "Entertainment: Television" },
    { id: "15", title: "Entertainment: Video Games" },
    { id: "16", title: "Entertainment: Board Games" },
    { id: "17", title: "Science &amp; Nature" },
    { id: "18", title: "Science: Computers" },
    { id: "19", title: "Science: Mathematics" },
    { id: "20", title: "Mythology" },
    { id: "21", title: "Sports" },
    { id: "22", title: "Geography" },
    { id: "23", title: "History" },
    { id: "24", title: "Politics" },
    { id: "25", title: "Art" },
    { id: "26", title: "Celebrities" },
    { id: "27", title: "Animals" },
    { id: "28", title: "Vehicles" },
    { id: "29", title: "Entertainment: Comics" },
    { id: "30", title: "Science: Gadgets" },
    { id: "31", title: "Entertainment: Japanese Anime &amp; Manga" },
    { id: "32", title: "Entertainment: Cartoon &amp; Animations" },
  ]
}

let questions = {};
let qidx = 0;
let players = [];

const stealorkeep = {
  keep: [],
  steal: []
}

const qinfo = {
  qid: -1,
  buzzed: []
};

app.use('/public', express.static(__dirname + '/public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/html/index.html');
});

app.get('/admin', (req, res) => {
  res.sendFile(__dirname + '/html/admin.html');
});
app.get('/display', (req, res) => {
  res.sendFile(__dirname + '/html/display.html');
});
app.get('/spinner', (req, res) => {
  res.sendFile(__dirname + '/html/spinner.html');
});

io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('chat message', (msg) => {
    console.log('message: ' + msg);
  });

  socket.on('register', (params) => {
    console.log('register', params);

    let p = players.find(p => p.uuid === params.uuid);
    if (p)
      p.name = params.name;
    else {
      let player = {
        uuid: params.uuid,
        name: params.name,
        state: "",
        answer: ""
      }
      players.push(player);
    }
    console.log(players);
    io.emit("admin players", players);
    io.emit("display show registered", players);

  });

  socket.on("unregister", (uuid) => {
    console.log("unregister", uuid);

    const idx = players.findIndex(p => p.uuid === uuid);
    if (idx !== -1)
      players.splice(idx, 1);
    io.emit("admin players", players);
    io.emit("display show registered", players);
    console.log(players);
  });

  socket.on("registered", () => {
    console.log("registered");
    io.emit("admin players", players);
    io.emit("display show registered", players);
  });

  socket.on('buzz', (uuid) => {
    console.log(uuid, 'buzzed');
    let player = players.find(p => p.uuid === uuid);
    if (player) {
      let name = player.name;
      qinfo.buzzed.push(name);
      player.state = "buzzed";
      console.log(players);
      io.emit("admin players", players);
      io.emit("display show registered", players);
    }
    //io.emit("display show player", { buzzed: qinfo.buzzed, first: qinfo.buzzed[0] });
  });

  socket.on('mc-answer', (params) => {
    console.log(params);
    qinfo.buzzed.push(params);
    let player = players.find(p => p.uuid === params.uuid);
    if (player)
      player.state = "answered";
    else
      console.log("player not found for uuid:", params.uuid);
    io.emit("admin players", players);
    io.emit("display show registered", players);
    //io.emit("display show mc-player", { buzzed: qinfo.buzzed, first: qinfo.buzzed[0] });
  });

  socket.on('open-answer', (params) => {
    console.log(params);
    qinfo.buzzed.push(params);
    let player = players.find(p => p.uuid === params.uuid);
    if (player)
      player.state = "answered";
    else
      console.log("player not found for uuid:", params.uuid);
    io.emit("admin players", players);
    io.emit("display show registered", players);

  });


  socket.on('buzz steal', (uuid) => {
    console.log('buzzed steal', uuid);
    let p = players.find(p => p.uuid == uuid);
    stealorkeep.steal.push(p);
  });

  socket.on('buzz keep', (uuid) => {
    console.log('buzzed keep', uuid);
    let p = players.find(p => p.uuid == uuid);
    stealorkeep.keep.push(p);
  });



  // admin
  socket.on('admin reset', () => {
    qinfo.qid = -1;
    qinfo.buzzed = [];
    players = [];
    io.emit("reset");
    questions_url = DEFAULT_QUESTIONS_URL;
  });

  socket.on('admin start r1', () => {
    qinfo.qid = -1;
    qinfo.buzzed = [];
    resetPlayersState(players);

    io.emit("display r1 intro");
    io.emit("show wait");

    fetchQuestions();
  });

  socket.on('admin start r2', () => {
    qinfo.qid = -1;
    qinfo.buzzed = [];
    resetPlayersState(players);

    io.emit("display r2 intro")
    io.emit("show wait");
  });

  socket.on('admin start r3', () => {
    qinfo.qid = -1;
    qinfo.buzzed = [];
    resetPlayersState(players);

    stealorkeep.keep = [];
    stealorkeep.steal = [];
    fetch(questions_url)
      .then(response => response.json())
      .then(json => {
        console.log(json)
        questions = json;
      })
    io.emit("display r3 intro")
    io.emit("show stealorkeep");
  });

  socket.on('admin set category', (catid) => {
    console.log("set category", catid)

    if (catid != null)
      questions_url = "https://opentdb.com/api.php?amount=50&category=" + catid + "&difficulty=" + question_difficuly + "&type=multiple";
    else
      questions_url = DEFAULT_QUESTIONS_URL;
    console.log("url:", questions_url)
    fetchQuestions();

    if (questions && questions.results && questions.results.length > 0) {
      resetPlayersState(players);
      io.emit("display show mc-question", { question: questions.results[qinfo.qid], question_num: qinfo.qid });
      io.emit("show mc-question", questions.results[qinfo.qid].question);
    } else {
      questions_url = DEFAULT_QUESTIONS_URL;
      io.emit("display r1 intro");
      io.emit("show wait");
    }
  });

  // R!

  socket.on('admin r1 show question', () => {
    qinfo.qid++;

    qinfo.buzzed = [];
    resetPlayersState(players);

    console.log('ADMIN: question:', qinfo.qid);
    if (questions && questions.results) {
      console.log("sent display question request");

      if (qinfo.qid < questions.results.length) {
        resetPlayersState(players);

        io.emit("display show mc-question", { question: questions.results[qinfo.qid], question_num: qinfo.qid });
        io.emit("show mc-question", questions.results[qinfo.qid].question);
        // io.emit("lock buzzer");

      }
    } else {
      console.log("no questions loaded");
    }
  });

  socket.on('admin r1 show choices', () => {
    if (questions && questions.results) {
      console.log("sent display question request");
      var options = [];
      options.push(questions.results[qinfo.qid].correct_answer);
      for (i = 0; i < questions.results[qinfo.qid].incorrect_answers.length; i++) {
        options.push(questions.results[qinfo.qid].incorrect_answers[i]);
      }
      var shuffled = shuffle(options);
      io.emit("display show choices", { choices: shuffled, answer: questions.results[qinfo.qid].correct_answer })
      // io.emit("reset buzzer");
      io.emit("show options", shuffled);
    }
  });

  socket.on('admin r1 show correct answer', () => {
    if (questions && questions.results && questions.results[qinfo.qid]) {
      let correctAns = questions.results[qinfo.qid].correct_answer;
      let winner = "";

      let correctPlayerList = [];
      let incorrectPlayerList = [];
      let unansweredPlayerList = [];

      for (i = 0; i < qinfo.buzzed.length; i++) {
        if (qinfo.buzzed[i].answer == correctAns) {
          if (winner == "") {
            winner = qinfo.buzzed[i].uuid;    // fastest person to answer correctly
            players.find(p => {
              if (p.uuid === qinfo.buzzed[i].uuid) {
                p.state = "winner";
                correctPlayerList.push(p);
              }
            });
          }
          else
            players.find(p => {
              if (p.uuid === qinfo.buzzed[i].uuid) {
                p.state = "correct";
                correctPlayerList.push(p);
              }
            });
        } else {
          players.find(p => {
            if (p.uuid === qinfo.buzzed[i].uuid) {
              p.state = "incorrect";
              incorrectPlayerList.push(p);
            }
          });
        }
      }

      // check for players who did not answer
      players.find(p => {
        let player = correctPlayerList.find(cp => cp.uuid == p.uuid);
        if (!player) {
          player = incorrectPlayerList.find(ip => ip.uuid == p.uuid);
          if (!player) {
            p.state = "incorrect";
            unansweredPlayerList.push(p);

          }
        }
      })

      console.log("correctPlayerList", correctPlayerList);
      console.log("incorrectPlayerList", incorrectPlayerList);
      console.log("unansweredPlayerList", unansweredPlayerList)

      let orderedPlayerList = correctPlayerList.concat(incorrectPlayerList.concat(unansweredPlayerList));
      console.log("orderedPlayerList", orderedPlayerList)
      players = orderedPlayerList;
      io.emit("admin players", players);
      io.emit("display show r1 correct answer", { answer: correctAns, players: players });
    }
  });

  // R2
  socket.on('admin r2 show question', () => {
    qinfo.qid++;
    qinfo.buzzed = [];
    resetPlayersState(players);

    console.log('ADMIN: question:', qinfo.qid);
    if (openquestions && openquestions.results) {
      if (qinfo.qid >= openquestions.results.length) {
        qinfo.qid = 0;
      }
      console.log("sent display question request");
      io.emit("display show open-question", { question: openquestions.results[qinfo.qid], question_num: qinfo.qid });
      io.emit("show open-question", openquestions.results[qinfo.qid].question);
      // io.emit("lock buzzer");
    }
  });

  socket.on('admin r2 show choices', () => {
    if (questions && questions.results) {
      console.log("sent display question request");
      var options = [];
      options.push(questions.results[qinfo.qid].correct_answer);
      for (i = 0; i < questions.results[qinfo.qid].incorrect_answers.length; i++) {
        options.push(questions.results[qinfo.qid].incorrect_answers[i]);
      }
      var shuffled = shuffle(options);
      io.emit("display show choices", { choices: shuffled, answer: questions.results[qinfo.qid].correct_answer })
      // io.emit("reset buzzer");
      io.emit("show options", shuffled);
    }
  });


  function sortResponsesByNumber(responses, correctAnswer) {
    const correct = Number(correctAnswer);
    console.log("correct number:", correct);
    for (let r of responses) {
      r.answer = Number(r.answer);
      r.diff = Math.abs(Number(r.answer) - correct);
    }
    console.log("responses with diffs:", responses);
    responses.sort((a, b) => a.diff - b.diff);

    console.log("sorted responses:", responses);
    return responses;
  }

  socket.on("admin r2 show correct answer", () => {
    if (
      openquestions &&
      openquestions.results &&
      openquestions.results[qinfo.qid]
    ) {
      let correctAns = openquestions.results[qinfo.qid].correct_answer;

      let orderedResponses = sortResponsesByNumber(qinfo.buzzed, correctAns);
      let orderedPlayerList = [];
      for (i = 0; i < orderedResponses.length; i++) {
        players.find(p => {
          if (p.uuid === orderedResponses[i].uuid) {
            p.answer = orderedResponses[i].answer + "," + orderedResponses[i].diff;
            orderedPlayerList.push(p);
          }
        });
      }

      // check for players who did not answer
      players.find(p => {
        let player = orderedResponses.find(or => or.uuid == p.uuid);
        if (!player) {
          orderedPlayerList.push(p);
        }
      });
      console.log("orderedPlayerList", orderedPlayerList)

      players = orderedPlayerList;
      io.emit("display show r2 correct answer", {
        answer: correctAns,
        players: players,
      });
    }
  });


  socket.on('admin show spin', () => {
    resetPlayersState(players);
    io.emit("display show spin")
  });

  socket.on('admin show categories', () => {
    io.emit("display show categories")
  });

  socket.on('admin spin wheel', () => {
    io.emit("display spin wheel")
  });

  socket.on('admin reset buzzers', () => {
    qinfo.buzzed = [];
    io.emit("reset buzzer");
  });

  socket.on('admin show answer', (ans) => {
    qinfo.buzzed = [];
    io.emit("display show answer", ans);
  });

  socket.on('admin show buzzer', (ans) => {
    qinfo.buzzed = [];
    io.emit("show buzzer", ans);
  });

  socket.on('admin show stealorkeep', (ans) => {
    qinfo.buzzed = [];
    resetPlayersState(players);

    io.emit("show stealorkeep", ans);
  });

  socket.on('admin show stealorkeep results', () => {
    console.log("admin show stealorkeep results");
    qinfo.buzzed = [];
    io.emit("display stealorkeep results", stealorkeep);
  });

});

server.listen(3000, () => {
  console.log('listening on *:3000');
});

// import node-fetch

// set url as constant


