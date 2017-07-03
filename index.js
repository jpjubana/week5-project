/*****************************Modules***************************/

const express = require('express');
const session = require('express-session');
const mustacheExpress = require('mustache-express');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();

app.engine('mustache', mustacheExpress());
app.set('views', './views');
app.set('view engine', 'mustache');

/*****************************Middleware***************************/

app.use('/css', express.static('public'));

app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
    secret: 'Wubba Lubba Dub Dub',
    resave: false,
    saveUninitialized: true
}));

/**********************************Routes***************************/

let words = fs.readFileSync("/usr/share/dict/words", "utf-8").toUpperCase().split("\n");
let randomIndex = Math.floor(Math.random() * words.length);
let randomWord = words[randomIndex];
let wordLetters = randomWord.split('');
let gameWord = wordLetters;
let gameLife = 8;
let guessWord = [];

console.log(gameWord);

function blanks(arr) {
    for (let i in arr) {
        guessWord.push(' ');
    }
};
blanks(wordLetters);

let lettersBucket = [];

let gameWin = true;
let gameLose = true;

app.get('/', function(req, res) {
    req.session.gameWin = gameWin;
    req.session.gameLose = gameLose;
    req.session.guessWord = guessWord;
    req.session.lettersBucket = lettersBucket;
    req.session.gameLife = gameLife;
    req.session.gameWord = gameWord;

    if (!gameWord) {
        let randomWord = words[randomIndex];
        let wordLetters = randomWord.split('');
        gameWord = req.session.gameWord = wordLetters;
    }

    let tags = { gameWord: gameWord, guessWord: guessWord, gameLife: gameLife, lettersBucket: lettersBucket, gameWin: gameWin, gameLose: gameLose };
    res.render('index', { tags: tags });
});

app.post("/", function(req, res) {
    req.session.gameLife = gameLife;
    let letterGuess = req.body.letter.toUpperCase();
    req.session.gameWord = wordLetters;
    req.session.guessWord = guessWord;
    req.session.lettersBucket = lettersBucket;
    if (lettersBucket.includes(letterGuess)) {
        res.send("pick another letter!");
    } else if (gameWord.includes(letterGuess)) {
        for (let i in gameWord) {
            if (letterGuess === gameWord[i]) {
                guessWord.splice(i, 1, letterGuess);
            }
        }
        lettersBucket.push(letterGuess)
    } else if (!gameWord.includes(letterGuess)) {
        lettersBucket.push(letterGuess);
        gameLife--
    }

    if (!guessWord.includes(' ')) {
        gameWin = false;
        res.redirect('/');
    }

    if (gameLife === 0) {
        gameLose = false;
        res.redirect('/');
    }

    res.redirect('/');
});

/**********************************Get shit going***************************/

app.listen(3000, () => console.log("Ninja We init!"));