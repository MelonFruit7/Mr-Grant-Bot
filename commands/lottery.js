const {numWord} = require("./numToWord.js");
const {pointsSymbol, pointsImage, xpUpdate, getPointsForBet} = require("./userStats.js");

module.exports = {
    name: "lottery",
    description: "Lottery game",
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
        con.query("SELECT * FROM points WHERE user = "+ interaction.user.id, (err, result) => {
            if (result.length > 0) {
                if (playingMap.has(interaction.user.id)) {
                    interaction.reply("You are currently playing a game").catch(error => console.log("Error replying to a message (lottery comamnd)"));
                    return;
                }
                bet = getPointsForBet(bet, result[0].points);
                
                if (bet > result[0].points || bet <= 0) {
                    interaction.reply("Can't bet more points then you have (or 0 points)").catch(error => console.log("Error replying to a message (dice comamnd)"));
                    return;
                }

                //Give the bot and user numbers and then get the amount of matches
                let matches = 0;
                let grantNumbers = [], userNumbers = [];
                for (let i = 0; i < 5; i++) grantNumbers.push(parseInt(Math.random()*99 + 1));
                for (let i = 0; i < 5; i++) {
                    userNumbers.push(parseInt(Math.random()*99 + 1));
                    for (let j = 0; j < grantNumbers.length; j++) if (userNumbers[i] == grantNumbers[j]) matches++;
                }
                let multiplier = Math.floor((matches/2.0) * ((matches-1)*4 + 1)*100)/100; //Random formula for a multiplier I made up

                let embed = new Discord.MessageEmbed();
                embed.setTitle("Lottery\n" + interaction.user.username);
                embed.addFields(
                    {name: "Grant's Numbers", value: `(${grantNumbers.join(", ")})\nMatching numbers: **${matches}**`, inline: true},
                    {name: `​`, value: `​`, inline: true},
                    {name: "Your Numbers", value: `(${userNumbers.join(", ")})\nReward multiplier: **${multiplier}**`, inline: true}
                );
                embed.setColor("PURPLE");
                if (matches > 0) {
                    con.query("UPDATE points SET points = " + (result[0].points + bet*multiplier) + " WHERE user = " + interaction.user.id);
                    embed.addFields(
                        {name: "🎉** WINNER **🎉", value: "You Won: **" + numWord(bet*multiplier) + "** "+pointsSymbol()+"\nPoints:\n```yaml\n" + (numWord(result[0].points + bet*multiplier)) + "```"}
                    );
                    if (bet >= parseInt(result[0].points*0.05)) {
                        xpUpdate(interaction.user.id, interaction, bet*5, con);
                        embed.setFooter({text: "🎖 Nice you gained xp 🎖"});
                    } else {
                        embed.setFooter({text: "🎟 Need to bet 5% or more to earn xp 🎟"});
                    }
                } else {
                    con.query("UPDATE points SET points = " + (result[0].points - bet) + " WHERE user = " + interaction.user.id);
                    embed.addFields(
                        {name: "🤡** LOSER **🤡", value: ("You lost: **" + numWord(bet) + "** "+pointsSymbol()+"\nPoints:\n```yaml\n" + (numWord(result[0].points - bet)) + "```")}
                    );
                }
                interaction.reply({embeds: [embed]});
            } else { 
              interaction.reply("You don't have points").catch(error => console.log("Error replying to a message (dice comamnd)"));  
            }
        });
    }
}