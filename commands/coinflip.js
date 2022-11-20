const {numWord} = require("./numToWord.js");
const {pointsSymbol, pointsImage, xpUpdate} = require("./userStats.js");

module.exports = {
    name: "coinflip",
    descirption: "flip a coin",
    exe(message, Discord, con, playingMap) {
        if (message.content.indexOf(" ", message.content.indexOf(" ") + 1) != -1) {
            let coinPick = message.content.substring(message.content.indexOf(" ") + 1, message.content.indexOf(" ", message.content.indexOf(" ") + 1)).toLowerCase();
            if (coinPick != "t" && coinPick != "h" && coinPick != "heads" && coinPick != "tails") {
                message.reply("You did something wrong, *cf {side of coin} {wager}").catch(error => console.log("Error replying to a message (cf comamnd)"));  
                return;
            }
            let bet = parseInt(message.content.substring(message.content.indexOf(" ", message.content.indexOf(" ") + 1) + 1));
            if (message.content.substring(message.content.indexOf(" ", message.content.indexOf(" ") + 1) + 1) == "half") bet = -1;
            if (message.content.substring(message.content.indexOf(" ", message.content.indexOf(" ") + 1) + 1) == "all") bet = -1;

            if (!isNaN(bet)) {
                con.query("SELECT * FROM points WHERE user = " + message.author.id, (err, result) => {
                  if (result.length > 0) {
                      if (playingMap.has(message.author.id)) {
                          message.reply("You are currently playing a game").catch(error => console.log("Error replying to a message (cf comamnd)"));
                          return;
                      }
                      if (message.content.substring(message.content.indexOf(" ", message.content.indexOf(" ") + 1) + 1) == "half") bet = parseInt(result[0].points / 2);
                      if (message.content.substring(message.content.indexOf(" ", message.content.indexOf(" ") + 1) + 1) == "all") bet = result[0].points;
                      if (bet > result[0].points || bet <= 0) {
                          message.reply("Can't bet more points then you have (or 0 points)").catch(error => console.log("Error replying to a message (cf comamnd)"));
                          return;
                      }
                      let botFlip = parseInt(Math.random() * 2) == 0 ? "h" : "t";
                      let embed = new Discord.MessageEmbed();
                      embed.setTitle("**CoinFlip**\n" + message.author.username);
                      embed.setThumbnail(pointsImage());
                      if (coinPick.substring(0,1) == botFlip) {
                        con.query("UPDATE points SET points = " + (result[0].points + bet) + " WHERE user = " + message.author.id);
                        embed.setDescription("\n\n🎉** WINNER **🎉\n\nYou Won: **" + numWord(bet) + "** "+pointsSymbol()+"\nPoints:\n```yaml\n" + numWord(result[0].points + bet) + "```");
                        if (bet >= parseInt(result[0].points*0.05)) {
                          xpUpdate(message.author.id, message, bet, con);
                          embed.setFooter({text: "🎖 Nice you gained xp 🎖"});
                        } else {
                          embed.setFooter({text: "🎟 Need to bet 5% or more to earn xp 🎟"});
                        }
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