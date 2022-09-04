const {numWord} = require("./numToWord.js");
const {pointsSymbol, pointsImage, xpUpdate} = require("./userStats.js");

module.exports = {
    name: "rps",
    description: "Rock Paper Scissors",
    exe(message, Discord, con) {
        let rpsArr = ["🗿", "📄", "✂️"];
         if (message.content.indexOf(" ") != -1) {
            let bet = parseInt(message.content.substring(message.content.indexOf(" ") + 1));
            if (message.content.substring(message.content.indexOf(" ") + 1) == "half") bet = -1;
            if (message.content.substring(message.content.indexOf(" ") + 1) == "all") bet = -1;
            if (!isNaN(bet)) {
              con.query("SELECT * FROM points WHERE user = " + message.author.id, (err, result) => {
                if (err) throw err;
                if (result.length > 0) {
                    if (result[0].playing == 1) {
                        message.reply("You are currently playing a game").catch(error => console.log("Error replying to a message (rps comamnd)"));
                        return;
                    }
                    if (message.content.substring(message.content.indexOf(" ") + 1) == "half") bet = parseInt(result[0].points / 2);
                    if (message.content.substring(message.content.indexOf(" ") + 1) == "all") bet = result[0].points;

                    setPlayingGame(message.author.id, 1, con);
                    if (bet > result[0].points || bet <= 0) {
                        setPlayingGame(message.author.id, 0, con);
                        message.reply("Can't bet more points then you have (or 0 points)").catch(error => console.log("Error replying to a message (rps comamnd)"));
                        return;
                    }
                    let embed = new Discord.MessageEmbed(); 
                    embed.setTitle("**Rock 🗿, Paper 📄, Scissors✂️**\n" + message.author.username + " is playing");
                    embed.setDescription("Wager: **"+numWord(bet)+"** "+pointsSymbol()+"\nPoints:```yaml\n"+(numWord(result[0].points - bet))+"```");
                    message.channel.send({embeds: [embed]}).then(msg => {
                        msg.react("🗿").catch(error => console.log("Error reacting to a message (rps comamnd)"));
                        msg.react("📄").catch(error => console.log("Error reacting to a message (rps comamnd)"));
                        msg.react("✂️").catch(error => console.log("Error reacting to a message (rps comamnd)"));
                        let filter = (reaction, user) => {
                            return (reaction.emoji.name == "🗿" || reaction.emoji.name == "📄" || reaction.emoji.name == "✂️")
                            && user.id == message.author.id;
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
                            con.query("UPDATE points SET points = " + (result[0].points - bet) + " WHERE user = " + message.author.id, (err, result) => { if (err) throw err });
                            embed.setDescription("Wager: **"+numWord(bet)+"** "+pointsSymbol()+"\nPoints:```yaml\n"+(numWord(result[0].points - bet))+"```\n**You Lost!**\n"+rpsArr[yourAnswer]+" vs " + rpsArr[rpsAnswer]);
                            msg.edit({embeds: [embed]}).catch(error => console.log("Error editing a message (rps comamnd)"));
                            //You Win
                            } else if(rpsAnswer === (yourAnswer - 1 < 0 ? 2 : yourAnswer - 1)) {
                            con.query("UPDATE points SET points = " + (result[0].points + bet) + " WHERE user = " + message.author.id, (err, result) => { if (err) throw err });
                            embed.setDescription("Wager: **"+numWord(bet)+"** "+pointsSymbol()+"\nPoints:```yaml\n"+(numWord(result[0].points + bet))+"```\n**You Won!**\n"+rpsArr[yourAnswer]+" vs " + rpsArr[rpsAnswer]);
                            if (bet >= parseInt(result[0].points*0.05)) {
                                xpUpdate(message.author.id, message, bet, con);
                                embed.setFooter({text: "🎖 Nice you gained xp 🎖"});
                            } else {
                                embed.setFooter({text: "🎟 Need to bet 5% or more to earn xp 🎟"});
                            }
                            msg.edit({embeds: [embed]}).catch(error => console.log("Error editing a message (rps comamnd)"));
                            }
                            setPlayingGame(message.author.id, 0, con);
                        }).catch(() => {
                            setPlayingGame(message.author.id, 0, con);
                            message.reply("Bro can't even play rock paper scissors (you ran out of time)").catch(error => console.log("Error replying to a message (rps comamnd)"));
                        });
                    });
                } else {
                    message.reply("You don't have points").catch(error => console.log("Error replying to a message (rps comamnd)"));
                }
              });
            } else {
                message.reply("Ayo no").catch(error => console.log("Error replying to a message (rps comamnd)"));
            }
         } else {
            message.reply("Bet some of your points").catch(error => console.log("Error replying to a message (rps comamnd)"));
         }
    }
}

function setPlayingGame(id, set, con) {
    con.query("UPDATE points SET playing = "+set+" WHERE user = " + id, (err, result) => {
        if (err) throw err;
    });
}