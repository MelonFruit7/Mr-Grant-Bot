const {numWord} = require("./numToWord.js");
const {pointsSymbol, pointsImage, xpUpdate, getPointsForBet} = require("./userStats.js");

module.exports = {
    name: "rps",
    description: "Rock Paper Scissors",
    options: [
        {
            type: "STRING",
            name: "bet",
            description: "Amount to bet for the game",
            required: true
        }
    ],
    exe(interaction, Discord, con, playingMap) {
        let rpsArr = ["🗿", "📄", "✂️"];
        let bet = interaction.options.get("bet").value;
        con.query("SELECT * FROM points WHERE user = " + interaction.user.id, (err, result) => {
            if (err) throw err;
            if (result.length > 0) {
                if (playingMap.has(interaction.user.id)) {
                    interaction.reply("You are currently playing a game").catch(error => console.log("Error replying to a message (rps comamnd)"));
                    return;
                }
                bet = getPointsForBet(bet, result[0].points);

                playingMap.set(interaction.user.id, 1);
                if (bet > result[0].points || bet <= 0) {
                    playingMap.delete(interaction.user.id);
                    interaction.reply("Can't bet more points then you have (or 0 points)").catch(error => console.log("Error replying to a message (rps comamnd)"));
                    return;
                }
                let embed = new Discord.MessageEmbed(); 
                embed.setTitle("**Rock 🗿, Paper 📄, Scissors✂️**\n" + interaction.user.username + " is playing");
                embed.setDescription("Wager: **"+numWord(bet)+"** "+pointsSymbol()+"\nPoints:```yaml\n"+(numWord(result[0].points - bet))+"```");
                interaction.deferReply();
                interaction.deleteReply();
                interaction.channel.send({embeds: [embed]}).then(msg => {
                    msg.react("🗿").catch(error => console.log("Error reacting to a message (rps comamnd)"));
                    msg.react("📄").catch(error => console.log("Error reacting to a message (rps comamnd)"));
                    msg.react("✂️").catch(error => console.log("Error reacting to a message (rps comamnd)"));
                    let filter = (reaction, user) => {
                        return (reaction.emoji.name == "🗿" || reaction.emoji.name == "📄" || reaction.emoji.name == "✂️")
                        && user.id == interaction.user.id;
                    }
                    msg.awaitReactions({filter, max: 1, time: 15000, errors: ["time"]}).then(x => {
                        let rpsAnswer = parseInt(Math.random() * 3);
                        let yourAnswer = null;
                        switch(String(x.first().emoji)) {
                            case "🗿": yourAnswer = 0;
                            break;
                            case "📄": yourAnswer = 1;
                            break;
                            case "✂️": yourAnswer = 2;
                        }
                        //Tie
                        if (yourAnswer === rpsAnswer) {
                            embed.setDescription("Wager: **"+numWord(bet)+"** "+pointsSymbol()+"\nPoints:```yaml\n"+(numWord(result[0].points))+"```\n**It's a Tie!**\n"+rpsArr[yourAnswer]+" vs " + rpsArr[rpsAnswer]);
                            msg.edit({embeds: [embed]}).catch(error => console.log("Error editing a message (rps comamnd)"));
                            //Bot Wins
                        } else if (yourAnswer === (rpsAnswer - 1 < 0 ? 2 : rpsAnswer - 1)) {
                            con.query("UPDATE points SET points = " + (result[0].points - bet) + " WHERE user = " + interaction.user.id, (err, result) => { if (err) throw err });
                            embed.setDescription("Wager: **"+numWord(bet)+"** "+pointsSymbol()+"\nPoints:```yaml\n"+(numWord(result[0].points - bet))+"```\n**You Lost!**\n"+rpsArr[yourAnswer]+" vs " + rpsArr[rpsAnswer]);
                            msg.edit({embeds: [embed]}).catch(error => console.log("Error editing a message (rps comamnd)"));
                            //You Win
                        } else if(rpsAnswer === (yourAnswer - 1 < 0 ? 2 : yourAnswer - 1)) {
                            con.query("UPDATE points SET points = " + (result[0].points + bet) + " WHERE user = " + interaction.user.id, (err, result) => { if (err) throw err });
                            embed.setDescription("Wager: **"+numWord(bet)+"** "+pointsSymbol()+"\nPoints:```yaml\n"+(numWord(result[0].points + bet))+"```\n**You Won!**\n"+rpsArr[yourAnswer]+" vs " + rpsArr[rpsAnswer]);
                            if (bet >= parseInt(result[0].points*0.05)) {
                                xpUpdate(interaction.user.id, interaction, bet, con);
                                embed.setFooter({text: "🎖 Nice you gained xp 🎖"});
                            } else {
                                embed.setFooter({text: "🎟 Need to bet 5% or more to earn xp 🎟"});
                            }
                            msg.edit({embeds: [embed]}).catch(error => console.log("Error editing a message (rps comamnd)"));
                        }
                        playingMap.delete(interaction.user.id);
                    }).catch(() => {
                        playingMap.delete(interaction.user.id);
                        interaction.channel.send("<@"+interaction.user+"> Bro can't even play rock paper scissors (you ran out of time)").catch(error => console.log("Error replying to a message (rps comamnd)"));
                    });
                });
            } else {
                interaction.reply("You don't have points").catch(error => console.log("Error replying to a message (rps comamnd)"));
            }
        });
    }
}