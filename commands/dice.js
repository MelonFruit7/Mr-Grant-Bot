const {numWord} = require("./numToWord.js");
const {pointsSymbol, pointsImage} = require("./points.js");

module.exports = {
    name: "dice",
    descirption: "roll dice",
    exe(message, Discord, con) {
     if (message.content.indexOf(" ") != -1) {
      let bet = parseInt(message.content.substring(message.content.indexOf(" ") + 1));
      if (message.content.substring(message.content.indexOf(" ") + 1) == "half") bet = -1337;
      if (!isNaN(bet)) {
          con.query("SELECT * FROM points WHERE user = " + message.author.id, (err, result) => {
            if (result.length > 0) {
                if (result[0].playing == 1) {
                    message.reply("You are currently playing a game").catch(error => console.log("Error replying to a message (dice comamnd)"));
                    return;
                }
                if (bet == -1337) bet = parseInt(result[0].points / 2);
                if (bet > result[0].points / 2 || bet <= 0) {
                    message.reply("Can't bet more than half of your points (or 0 points)").catch(error => console.log("Error replying to a message (dice comamnd)"));
                    return;
                }
                let diceEmoji = ["<:dice1:1013282071503982683>","<:dice2:1013282092559388734>","<:dice3:1013282155230674984>","<:dice4:1013282181424095335>","<:dice5:1013282200604647457>","<:dice6:1013282224818372698>"];
                let yourDice = parseInt(Math.random() * 6);
                let embed = new Discord.MessageEmbed();
                embed.setTitle("Dice\n" + message.author.username);
                embed.setThumbnail(pointsImage());
                embed.setColor("PURPLE");
                if (yourDice == parseInt(Math.random() * 6)) {
                    con.query("UPDATE points SET points = " + (result[0].points + bet*5) + " WHERE user = " + message.author.id);
                    embed.setDescription(diceEmoji[yourDice]+"\n\n🎉** WINNER **🎉\n\nYou Won: **" + numWord(bet*5) + "** "+pointsSymbol()+"\nPoints:\n```yaml\n" + (numWord(result[0].points + bet*5)) + "```");
                } else {
                    con.query("UPDATE points SET points = " + (result[0].points - bet) + " WHERE user = " + message.author.id);
                    embed.setDescription(diceEmoji[yourDice]+"\n\n🤡** LOSER **🤡\n\nYou lost: **" + numWord(bet) + "** "+pointsSymbol()+"\nPoints:\n```yaml\n" + (numWord(result[0].points - bet)) + "```");
                }
                message.channel.send({embeds: [embed]});
            } else { 
              message.reply("You don't have points").catch(error => console.log("Error replying to a message (dice comamnd)"));  
            }
          });
      } else {
        message.reply("Ayo no").catch(error => console.log("Error replying to a message (dice comamnd)"));
      }
     } else {
        message.reply("Bet some of your points").catch(error => console.log("Error replying to a message (dice comamnd)"));
     }
    }
}