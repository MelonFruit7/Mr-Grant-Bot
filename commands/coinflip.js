const {numWord} = require("./numToWord.js");
const {pointsSymbol, pointsImage} = require("./points.js");

module.exports = {
    name: "coinflip",
    descirption: "flip a coin",
    exe(message, Discord, con) {
        if (message.content.indexOf(" ", message.content.indexOf(" ") + 1) != -1) {
            let coinPick = message.content.substring(message.content.indexOf(" ") + 1, message.content.indexOf(" ", message.content.indexOf(" ") + 1)).toLowerCase();
            if (coinPick != "t" && coinPick != "h" && coinPick != "heads" && coinPick != "tails") {
                message.reply("You did something wrong, *cf {side of coin} {wager}").catch(error => console.log("Error replying to a message (cf comamnd)"));  
                return;
            }
            let bet = parseInt(message.content.substring(message.content.indexOf(" ", message.content.indexOf(" ") + 1) + 1));
            if (message.content.substring(message.content.indexOf(" ", message.content.indexOf(" ") + 1) + 1) == "half") bet = -1337;
            if (!isNaN(bet)) {
                con.query("SELECT * FROM points WHERE user = " + message.author.id, (err, result) => {
                  if (result.length > 0) {
                      if (result[0].playing == 1) {
                          message.reply("You are currently playing a game").catch(error => console.log("Error replying to a message (cf comamnd)"));
                          return;
                      }
                      if (bet == -1337) bet = parseInt(result[0].points / 2);
                      if (bet > result[0].points / 2 || bet <= 0) {
                          message.reply("Can't bet more than half of your points (or 0 points)").catch(error => console.log("Error replying to a message (cf comamnd)"));
                          return;
                      }
                      let botFlip = parseInt(Math.random() * 2) == 0 ? "h" : "t";
                      let embed = new Discord.MessageEmbed();
                      embed.setTitle("**CoinFlip**\n" + message.author.username);
                      embed.setThumbnail(pointsImage());
                      if (coinPick.substring(0,1) == botFlip) {
                        con.query("UPDATE points SET points = " + (result[0].points + bet) + " WHERE user = " + message.author.id);
                        embed.setDescription("\n\n🎉** WINNER **🎉\n\nYou Won: **" + numWord(bet) + "** "+pointsSymbol()+"\nPoints:\n```yaml\n" + numWord(result[0].points + bet) + "```");
                      } else {
                        con.query("UPDATE points SET points = " + (result[0].points - bet) + " WHERE user = " + message.author.id);
                        embed.setDescription("\n\n🤡** LOSER **🤡\n\nYou Lost: **" + numWord(bet) + "** "+pointsSymbol()+"\nPoints:\n```yaml\n" + numWord(result[0].points - bet) + "```");
                      }
                      message.channel.send({embeds: [embed]});
                  } else { 
                    message.reply("You don't have points").catch(error => console.log("Error replying to a message (cf comamnd)"));  
                  }
                });
            } else {
              message.reply("Ayo no").catch(error => console.log("Error replying to a message (cf comamnd)"));
            }
           } else {
              message.reply("You forgot something, *cf {side of coin} {wager}").catch(error => console.log("Error replying to a message (cf comamnd)"));
           } 
    }
}
        
function setPlayingGame(id, set, con) {
    con.query("UPDATE points SET playing = "+set+" WHERE user = " + id, (err, result) => {
        if (err) throw err;
    });
}