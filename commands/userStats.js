const {numWord} = require("./numToWord.js");

module.exports = {
    name: "userStats",
    description: "Displays a users profile",
    exe(message, Discord, con) {
        let embed = new Discord.MessageEmbed();
        if (message.content.indexOf(" ") != -1) {
            if (message.mentions.users.first() == undefined) {
                message.reply("Not a user").catch(error => console.log("Error replying to message (points command)"));
                return;
            }
            con.query("SELECT * FROM points WHERE user = " + message.mentions.users.first().id, function(err, result) {
                if (err) throw err;
                if (result.length > 0) {
                    embed.setTitle(message.mentions.users.first().username + "'s stats");
                    embed.setColor("GREEN");
                    embed.setThumbnail(message.mentions.users.first().displayAvatarURL());
                    let xpBar = "|";
                    for (let i = 0; i < 20; i++) {
                        if (i < parseInt(result[0].xp / (parseInt(100 * Math.pow(1.5, result[0].lvl) / 20)))) {
                            xpBar += "#";
                        } else {
                            xpBar += "-";
                        }
                    }
                    xpBar += "|";
                    embed.setDescription(`\n\n**Points: ${numWord(result[0].points)}** ${pointsSymbol()}\n\n**Level: ${result[0].lvl + 1}**\n**Xp: ${xpBar} ${numWord(result[0].xp)}/${numWord(parseInt(100 * Math.pow(1.5, result[0].lvl)))}**\n\n**Base Guess: ${numWord(4000 * Math.pow(2, Math.floor(result[0].lvl / 3)))} ${pointsSymbol()}**\n\n**Base Hourly: ${numWord(parseInt(50*Math.pow(1.3, result[0].lvl)))} ${pointsSymbol()}**`);
                    message.channel.send({embeds: [embed]});
                } else {
                    message.reply("This user does not have any stats").catch(error => console.log("Error replying to message (stats command)"));
                }
            });
        } else {
            con.query("SELECT * FROM points WHERE user = " + message.author.id, function(err, result) {
                if (err) throw err;
                if (result.length > 0) {
                    embed.setTitle(message.author.username + "'s stats");
                    embed.setColor("GREEN");
                    embed.setThumbnail(message.author.displayAvatarURL());
                    let xpBar = "|";
                    for (let i = 0; i < 20; i++) {
                        if (i < parseInt(result[0].xp / (parseInt(100 * Math.pow(1.5, result[0].lvl) / 20)))) {
                            xpBar += "#";
                        } else {
                            xpBar += "-";
                        }
                    }
                    xpBar += "|";
                    embed.setDescription(`\n\n**Points: ${numWord(result[0].points)}** ${pointsSymbol()}\n\n**Level: ${result[0].lvl + 1}**\n**Xp: ${xpBar} ${numWord(result[0].xp)}/${numWord(parseInt(100 * Math.pow(1.5, result[0].lvl)))}**\n\n**Base Guess: ${numWord(4000 * Math.pow(2, Math.floor(result[0].lvl / 3)))} ${pointsSymbol()}**\n\n**Base Hourly: ${numWord(parseInt(50*Math.pow(1.3, result[0].lvl)))} ${pointsSymbol()}**`);
                    message.channel.send({embeds: [embed]});
                } else {
                    message.reply("You don't have any stats").catch(error => console.log("Error replying to message (stats command)"));
                }
            });
        }
    },
    pointsSymbol() {
        return "<:points:1013179263547084900>";
    },
    pointsImage() {
        return "https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/b9347f46-a81e-4c42-8322-192a0181c8a6/d6p9iud-8ff4bad0-9810-4a13-ad44-4354afee3f14.png?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7InBhdGgiOiJcL2ZcL2I5MzQ3ZjQ2LWE4MWUtNGM0Mi04MzIyLTE5MmEwMTgxYzhhNlwvZDZwOWl1ZC04ZmY0YmFkMC05ODEwLTRhMTMtYWQ0NC00MzU0YWZlZTNmMTQucG5nIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmZpbGUuZG93bmxvYWQiXX0.EeiwQqATdqYhgIWeJkz4KmV19c6httUbnwclZs8xX24";
    },
    xpUpdate(id, message, earned, con) {
        con.query("SELECT * FROM points WHERE user = " + id, (err, result) => {
            if (err) throw err;
            con.query("UPDATE points SET xp = " + (result[0].xp + earned) + " WHERE user = " + id);
            if (result[0].xp + earned >= parseInt(100 * Math.pow(1.5, result[0].lvl))) {
                con.query("UPDATE points SET xp = 0, lvl = " +(++result[0].lvl)+ " WHERE user = " + id);
                message.reply("🎉 Congrats, you leveled up to lvl " + (result[0].lvl + 1) + " 🎉").catch(error => console.log("Error replying to a message (userStats function)"));
            }
        });
    }
}

function pointsSymbol() {
    return "<:points:1013179263547084900>";
}