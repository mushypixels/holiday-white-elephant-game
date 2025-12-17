An alternative game for a holiday white elephant giveaway.

HARDWARE REQUIREMENTS:
1. PC with NodeJS to run the game engine (server.js)
2. Mobile phone brower to run the Admin page
3. Mobile phone or PC connected to TV to show the Display page via a browser
4. Mobile phone for each player 

GAME BROWSER SETUP:

/youripaddress:3000/          = player brower on their phone

/youripaddress:3000/display   = connect this to the screen via AirPlay etc

/youripaddress:3000/admin     = the games master should have this on their phone. He controls what is shown on the display and the user's phone. 

GAME RULES:
1. Each player brings a wrapped present and puts in into a pile
2. Set up: each player connects to the game via the QR code on their phone and enters a name
3. Round 1: The players are shown a question and the fast to get it right will get to choose an gift but cannot open yet
4. Round 2: Once all players have a unwrapped gift, they must answer an open-ended question. The closest to the right anwswer will get to spin the wheel last
5. Round 2: Spin the wheel, each player takes it in turn to spin the wheel (currently the admin spins it for them). The player must then do what is on the wheel segment.
6. Round 2: Game ends when all players have unopened their gifts

NOTES:
1. It calls the Open Trivia DB API (https://opentdb.com) to fetch a block of questions at the start of Round 1.
2. Round 2 uses a local json file with a prefixed list of questions


IMPROVEMENTS NEEDED:

1. admin page to be more user friendly
2. add player ability to spin the wheel when its their turn
3. add functionality to track who has spun etc.
4. General UI improvements


