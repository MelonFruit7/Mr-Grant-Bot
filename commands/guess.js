const {numWord} = require("./numToWord.js");
const {pointsSymbol, pointsImage} = require("./userStats.js");
const { InteractionCollector } = require('discord.js');
const { InteractionTypes } = require('discord.js/src/util/Constants.js');

module.exports = {
    name: "guess",
    description: "Guessing game",
    exe(interaction, con, playingMap, client) {
        con.query("SELECT * FROM points WHERE user = " + interaction.user.id, function(err, result) {
            if (err) throw err;
            if (result.length > 0) {
                if (!playingMap.has(interaction.user.id)) {
                   playingMap.set(interaction.user.id, 1);
                   interaction.reply("Guess a number between 1 - 1000").catch(error => console.log("Error replying to message (guess command)"));
                   let answer = parseInt(Math.random() * 1000) + 1;
                   guessCommand(answer, interaction, (4000 * Math.pow(2, Math.floor(result[0].lvl / 3))), con, playingMap, client);
                } else {
                    interaction.reply("You are currently playing").catch(error => console.log("Error replying to message (guess command)"));
                }
            } else {
                con.query("INSERT INTO points (user, points, xp, lvl) VALUES (" + interaction.user.id + ", 0, 0, 0)", function (err, result) { if (err) throw err; });
                playingMap.set(interaction.user.id, 1);
                interaction.reply("Guess a number between 1 - 1000").catch(error => console.log("Error replying to message (guess command)"));
                let answer = parseInt(Math.random() * 1000) + 1;
                guessCommand(answer, interaction, 4000, con, playingMap,client);
            }
        });
    }
}

function guessCommand(answer, interaction, points, con, playingMap, client) {
    if (points == 0) {
        playingMap.delete(interaction.user.id);
        interaction.followUp("<@"+interaction.user+"> You took too many guesses no points for you, the answer was " + answer).catch(error => console.log("Error replying to message (guess command)"));
        return;
    }

    let collector = new InteractionCollector(client, {
        channel: interaction.channel,
        filter: (i) => i.commandName === 'play' && i.user.id === interaction.user.id,
        time: 15000,
        interactionType: InteractionTypes.APPLICATION_COMMAND,
        max: 1,
    });
  
    collector.on('collect', (i) => {
        let msg = i.options.get("input").value;
        if (String(parseInt(msg)) == "NaN") {
            i.reply("Numbers Only :(").catch(error => console.log("Error replying to message (guess command)"));
            guessCommand(answer, interaction, parseInt(points / 2), con, playingMap, client);
            return;
        }
              if (!(parseInt(msg) == answer)) {
                  if (parseInt(msg) > answer) {
                    i.reply("Not "+msg+", Guess Lower").catch(error => console.log("Error replying to message (guess command)"));
                  } else {
                    i.reply("Not "+msg+", Guess Higher").catch(error => console.log("Error replying to message (guess command)"));
                  }
                  guessCommand(answer, interaction, parseInt(points / 2), con, playingMap, client);
                  return;
              }

              playingMap.delete(i.user.id);
              i.reply(`Congrats, ${i.user}! You Guessed The Number Correctly! It Was ${answer}`);

              con.query("SELECT * FROM points WHERE user = " + i.user.id, function (err, result) {
                if (err) throw err;
                    let currentPoints = parseInt(result[0].points);
                    con.query("UPDATE points SET points = " + (currentPoints + points) + " WHERE user = " + i.user.id, function(err, result) {
                        if (err) throw err;
                        interaction.followUp("Congrats <@"+interaction.user+"> you gained " + numWord(points) + " "+pointsSymbol()+", you now have " + numWord(currentPoints + points) + " "+pointsSymbol()+"").catch(error => console.log("Error replying to message (guess command)"));
                    });
              });
              return;
    });
    collector.on('end', (collected, reason) => {
        if (reason === "time") {
            playingMap.delete(interaction.user.id);
            interaction.followUp("<@"+interaction.user+"> L Bozo you ran out of time").catch(error => console.log("Error replying to message (guess command)"));
        }
    });

}