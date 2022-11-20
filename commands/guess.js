const {numWord} = require("./numToWord.js");
const {pointsSymbol, pointsImage} = require("./userStats.js");

module.exports = {
    name: "guess",
    description: "guessing game",
    exe(message, con, playingMap) {
        con.query("SELECT * FROM points WHERE user = " + message.author.id, function(err, result) {
            if (err) throw err;
            if (result.length > 0) {
                if (!playingMap.has(message.author.id)) {
                   playingMap.set(message.author.id, 1);
                   message.reply("Guess a number between 1 - 1000").catch(error => console.log("Error replying to message (guess command)"));
                   let answer = parseInt(Math.random() * 1000) + 1;
                   guessCommand(answer, message, (4000 * Math.pow(2, Math.floor(result[0].lvl / 3))), con, playingMap);

                } else {
                    message.reply("You are currently playing").catch(error => console.log("Error replying to message (guess command)"));
                }
            } else {
                con.query("INSERT INTO points (user, points, xp, lvl) VALUES (" + message.author.id + ", 0, 0, 0)", function (err, result) { if (err) throw err; });
                playingMap.set(message.author.id, 1);
                message.reply("Guess a number between 1 - 1000").catch(error => console.log("Error replying to message (guess command)"));
                let answer = parseInt(Math.random() * 1000) + 1;
                guessCommand(answer, message, 4000, con, playingMap);
            }
        });
    }
}

function guessCommand(answer, message, points, con, playingMap) {
    if (points == 0) {
        playingMap.delete(message.author.id);
        message.reply("You took too many guesses no points for you, the answer was " + answer).catch(error => console.log("Error replying to message (guess command)"));
        return;
    }
    let msg_filter = (m) => m.author.id === message.author.id;
    message.channel.awaitMessages({filter: msg_filter, time: 10000, max: 1}).then(x => {
        let msg = x.first();
        if (String(parseInt(msg.content)) == "NaN") {
            guessCommand(answer, message, parseInt(points / 2), con, playingMap);
            msg.reply("Numbers Only :(").catch(error => console.log("Error replying to message (guess command)"));
            return;
        }
              if (!(parseInt(msg.content) == answer)) {
                  if (parseInt(msg.content) > answer) {
                    msg.reply("Guess Lower").catch(error => console.log("Error replying to message (guess command)"));
                  } else {
                    msg.reply("Guess Higher").catch(error => console.log("Error replying to message (guess command)"));
                  }
                  guessCommand(answer, message, parseInt(points / 2), con, playingMap);
                  return;
              }

              con.query("SELECT * FROM points WHERE user = " + message.author.id, function (err, result) {
                if (err) throw err;
                    let currentPoints = parseInt(result[0].points);
                    con.query("UPDATE points SET points = " + (currentPoints + points) + " WHERE user = " + message.author.id, function(err, result) {
                        if (err) throw err;
                        message.reply("Congrats you gained " + numWord(points) + " "+pointsSymbol()+", you now have " + numWord(currentPoints + points) + " "+pointsSymbol()+"").catch(error => console.log("Error replying to message (guess command)"));
                    });
              });

              playingMap.delete(message.author.id);
              return msg.channel.send(`Congrats, ${msg.author}! You Guessed The Number Correctly! It Was ${answer}`);
    }).catch(() => {
        playingMap.delete(message.author.id);
        message.reply("L Bozo you ran out of time").catch(error => console.log("Error replying to message (guess command)"));
    });
}