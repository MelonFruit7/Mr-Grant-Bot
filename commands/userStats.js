const {numWord} = require("./numToWord.js");

module.exports = {
    name: "stats",
    description: "Displays a users profile",
    options: [
        {
            type: "STRING",
            name: "user_id",
            description: "User ID",
            required: false
        }
    ],
    exe(interaction, Discord, con, client) {
        let embed = new Discord.MessageEmbed();
        if (interaction.options.get("user_id") != undefined) {
            let queryParam = interaction.options.get("user_id").value; //Get the input
            if (queryParam.startsWith("<")) queryParam = queryParam.substring(2, queryParam.length-1); //If the input was a mention turn it into an id
            let username = client.users.cache.get(queryParam); //Get the username of the user via the cache
            client.users.fetch(queryParam).then(user => {
                username = user.username;
                embed.setThumbnail(user.displayAvatarURL());
            }).catch(() => {
                interaction.reply("Can't find user").catch(error => console.log("Error replying to message (points command)"));
                return;
            });
            if (username == undefined) return;

            con.query("SELECT * FROM points WHERE user = " + queryParam, function(err, result) {
                if (err) throw err;
                if (result.length > 0) {
                    embed.setTitle(username + "'s stats");
                    embed.setColor("GREEN");
                    let xpBar = "|";
                    for (let i = 0; i < 20; i++) {
                        if (i < parseInt(result[0].xp / (parseInt(100 * Math.pow(1.5, result[0].lvl) / 20)))) {
                            xpBar += "#";
                        } else {
                            xpBar += "-";
                        }
                    }
                    xpBar += "|";
                    embed.setDescription(`**Prestige Level: ${result[0].badgeLevel} 🐔**\n\n**Points: ${numWord(result[0].points)}** ${pointsSymbol()}\n\n**Stock Points: ${numWord(result[0].stockPoints)} 🐦**\n\n**Level: ${result[0].lvl + 1}**\n**Xp: ${xpBar} ${numWord(result[0].xp)}/${numWord(parseInt(100 * Math.pow(1.5, result[0].lvl)))}**\n\n**Base Guess: ${numWord(4000 * Math.pow(2, Math.floor(result[0].lvl / 3)))} ${pointsSymbol()}**\n\n**Base Hourly: ${numWord(parseInt(50*Math.pow(1.3, result[0].lvl)))} ${pointsSymbol()}**`);
                    interaction.reply({embeds: [embed]}).catch(error => console.log("Error replying to a message (stats comamnd)"));
                } else {
                    interaction.reply("This user does not have any stats").catch(error => console.log("Error replying to message (stats command)"));
                }
            });
        } else {
            con.query("SELECT * FROM points WHERE user = " + interaction.user.id, function(err, result) {
                if (err) throw err;
                if (result.length > 0) {
                    embed.setTitle(interaction.user.username + "'s stats");
                    embed.setColor("GREEN");
                    embed.setThumbnail(interaction.user.displayAvatarURL());
                    let xpBar = "|";
                    for (let i = 0; i < 20; i++) {
                        if (i < parseInt(result[0].xp / (parseInt(100 * Math.pow(1.5, result[0].lvl) / 20)))) {
                            xpBar += "#";
                        } else {
                            xpBar += "-";
                        }
                    }
                    xpBar += "|";
                    embed.setDescription(`**Prestige Level: ${result[0].badgeLevel} 🐔**\n\n**Points: ${numWord(result[0].points)}** ${pointsSymbol()}\n\n**Stock Points: ${numWord(result[0].stockPoints)} 🐦**\n\n**Level: ${result[0].lvl + 1}**\n**Xp: ${xpBar} ${numWord(result[0].xp)}/${numWord(parseInt(100 * Math.pow(1.5, result[0].lvl)))}**\n\n**Base Guess: ${numWord(4000 * Math.pow(2, Math.floor(result[0].lvl / 3)))} ${pointsSymbol()}**\n\n**Base Hourly: ${numWord(parseInt(50*Math.pow(1.3, result[0].lvl)))} ${pointsSymbol()}**`);
                    interaction.reply({embeds: [embed]}).catch(error => console.log("Error replying to a message (stats comamnd)"));
                } else {
                    interaction.reply("You don't have any stats").catch(error => console.log("Error replying to message (stats command)"));
                }
            });
        }
    },
    pointsSymbol() {
        return "<a:GrantCoin:1187594509538824334>";
    },
    pointsImage() {
        return "https://cdn.discordapp.com/attachments/855207922891882506/1187603105915867186/coin.gif?ex=65977c95&is=65850795&hm=9defeeba7fd14ca579eed4bc79502f7ceeb08a2601fbf018ac451e29d56aba74&";
    },
    xpUpdate(id, interaction, earned, con) {
        con.query("SELECT * FROM points WHERE user = " + id, (err, result) => {
            if (err) throw err;
            con.query("UPDATE points SET xp = " + (result[0].xp + earned) + " WHERE user = " + id);
            if (result[0].xp + earned >= parseInt(100 * Math.pow(1.5, result[0].lvl))) {
                con.query("UPDATE points SET xp = 0, lvl = " +(++result[0].lvl)+ " WHERE user = " + id);
                interaction.channel.send("🎉 Congrats <@"+interaction.user+">, you leveled up to lvl " + (result[0].lvl + 1) + " 🎉").catch(error => console.log("Error replying to a message (userStats function)"));
            }
        });
    },
    getPointsForBet(bet, points) {
        if (bet == "all") return points;
        if (bet == "half") return points/2;
        if (bet.endsWith("%")) {
            bet = parseInt(bet.substring(0, bet.length-1));
            if (!isNaN(bet)) {
                return Math.floor(points*(bet/100.0));
            }
        }
        if (!isNaN(parseInt(bet))) return parseInt(bet);
        return -1;
    }
}

function pointsSymbol() {
    return "<a:GrantCoin:1187594509538824334>";
}
