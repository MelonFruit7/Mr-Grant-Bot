const {numWord} = require("./numToWord.js");
const {pointsSymbol, pointsImage, xpUpdate, getPointsForBet} = require("./userStats.js");

module.exports = {
    name: "coinflip",
    description: "flip a coin",
    options: [
      {
        type: "STRING",
        name: "coin",
        description: "Side of coin you're betting on",
        required: true
      },
      {
          type: "STRING",
          name: "bet",
          description: "Amount to bet for the game",
          required: true
      }
  ],
    exe(interaction, Discord, con, playingMap) {
            let coinPick = interaction.options.get("coin").value.toLowerCase();
            if (coinPick != "t" && coinPick != "h" && coinPick != "heads" && coinPick != "tails") {
                interaction.reply("You did something wrong, *cf {side of coin} {wager}").catch(error => console.log("Error replying to a message (cf comamnd)"));  
                return;
            }
            let bet = interaction.options.get("bet").value;
            con.query("SELECT * FROM points WHERE user = " + interaction.user.id, (err, result) => {
                  if (result.length > 0) {
                      if (playingMap.has(interaction.user.id)) {
                          interaction.reply("You are currently playing a game").catch(error => console.log("Error replying to a message (cf comamnd)"));
                          return;
                      }
                      bet = getPointsForBet(bet, result[0].points);

                      if (bet > result[0].points || bet <= 0) {
                          interaction.reply("Can't bet more points then you have (or 0 points)").catch(error => console.log("Error replying to a message (cf comamnd)"));
                          return;
                      }
                      let botFlip = parseInt(Math.random() * 2) == 0 ? "h" : "t";
                      let embed = new Discord.MessageEmbed();
                      embed.setTitle("**CoinFlip**\n" + interaction.user.username);
                      embed.setThumbnail(pointsImage());
                      if (coinPick.substring(0,1) == botFlip) {
                        con.query("UPDATE points SET points = " + (result[0].points + bet) + " WHERE user = " + interaction.user.id);
                        embed.setDescription("\n\n🎉** WINNER **🎉\n\nYou Won: **" + numWord(bet) + "** "+pointsSymbol()+"\nPoints:\n```yaml\n" + numWord(result[0].points + bet) + "```");
                        if (bet >= parseInt(result[0].points*0.05)) {
                          xpUpdate(interaction.user.id, interaction, bet, con);
                          embed.setFooter({text: "🎖 Nice you gained xp 🎖"});
                        } else {
                          embed.setFooter({text: "🎟 Need to bet 5% or more to earn xp 🎟"});
                        }
                      } else {
                        con.query("UPDATE points SET points = " + (result[0].points - bet) + " WHERE user = " + interaction.user.id);
                        embed.setDescription("\n\n🤡** LOSER **🤡\n\nYou Lost: **" + numWord(bet) + "** "+pointsSymbol()+"\nPoints:\n```yaml\n" + numWord(result[0].points - bet) + "```");
                      }
                      interaction.reply({embeds: [embed]}).catch(error => console.log("Error replying to a message (cf comamnd)"));
                  } else { 
                    interaction.reply("You don't have points").catch(error => console.log("Error replying to a message (cf comamnd)"));  
                  }
            });
    }
}
