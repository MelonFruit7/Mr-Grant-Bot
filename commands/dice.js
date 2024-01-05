const {numWord} = require("./numToWord.js");
const {pointsSymbol, pointsImage, xpUpdate, getPointsForBet} = require("./userStats.js");

module.exports = {
    name: "dice",
    description: "Roll a 6 to win",
    options: [
        {
            type: "STRING",
            name: "bet",
            description: "Amount to bet for the game",
            required: true
        }
    ],
    exe(interaction, Discord, con, playingMap) {
        let bet = interaction.options.get("bet").value;
        con.query("SELECT * FROM points WHERE user = " + interaction.user.id, (err, result) => {
            if (result.length > 0) {
                if (playingMap.has(interaction.user.id)) {
                    interaction.reply("You are currently playing a game").catch(error => console.log("Error replying to a message (dice comamnd)"));
                    return;
                }
                bet = getPointsForBet(bet, result[0].points);
                
                if (bet > result[0].points || bet <= 0) {
                    interaction.reply("Can't bet more points then you have (or 0 points)").catch(error => console.log("Error replying to a message (dice comamnd)"));
                    return;
                }
                let diceEmoji = ["<:dice1:1013282071503982683>","<:dice2:1013282092559388734>","<:dice3:1013282155230674984>","<:dice4:1013282181424095335>","<:dice5:1013282200604647457>","<:dice6:1013282224818372698>"];
                let yourDice = parseInt(Math.random() * 6);
                let embed = new Discord.MessageEmbed();
                embed.setTitle("Dice\n" + interaction.user.username);
                embed.setThumbnail(pointsImage());
                embed.setColor("PURPLE");
                if (yourDice == 5) {
                    con.query("UPDATE points SET points = " + (result[0].points + bet*5) + " WHERE user = " + interaction.user.id);
                    embed.setDescription(diceEmoji[yourDice]+"\n\n🎉** WINNER **🎉\n\nYou Won: **" + numWord(bet*5) + "** "+pointsSymbol()+"\nPoints:\n```yaml\n" + (numWord(result[0].points + bet*5)) + "```");
                    if (bet >= parseInt(result[0].points*0.05)) {
                        xpUpdate(interaction.user.id, interaction, bet*5, con);
                        embed.setFooter({text: "🎖 Nice you gained xp 🎖"});
                    } else {
                        embed.setFooter({text: "🎟 Need to bet 5% or more to earn xp 🎟"});
                    }
                } else {
                    con.query("UPDATE points SET points = " + (result[0].points - bet) + " WHERE user = " + interaction.user.id);
                    embed.setDescription(diceEmoji[yourDice]+"\n\n🤡** LOSER **🤡\n\nYou lost: **" + numWord(bet) + "** "+pointsSymbol()+"\nPoints:\n```yaml\n" + (numWord(result[0].points - bet)) + "```");
                }
                interaction.reply({embeds: [embed]}).catch(error => console.log("Error replying to a message (dice comamnd)"));
            } else { 
              interaction.reply("You don't have points").catch(error => console.log("Error replying to a message (dice comamnd)"));  
            }
          });
    }
}